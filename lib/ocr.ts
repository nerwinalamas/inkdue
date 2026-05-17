import TextRecognition from "@react-native-ml-kit/text-recognition";

export type OcrResult = {
  billerName: string | null;
  amount: number | null;
  dueDate: string | null; // ISO "2025-06-10"
  rawText: string;
};

// ─── Main OCR function ────────────────────────────────────────────────────────

export async function extractBillInfo(imageUri: string): Promise<OcrResult> {
  const result = await TextRecognition.recognize(imageUri);
  const rawText = result.text ?? "";

  return {
    billerName: parseBillerName(rawText),
    amount: parseAmount(rawText),
    dueDate: parseDueDate(rawText),
    rawText,
  };
}

// ─── Parsers ──────────────────────────────────────────────────────────────────

/**
 * Parse amount — looks for PHP peso patterns
 * e.g. "₱3,200.50", "PHP 3200.50", "3,200.50"
 */
function parseAmount(text: string): number | null {
  const patterns = [
    /₱\s*([\d,]+\.?\d*)/, // ₱3,200.50
    /PHP\s*([\d,]+\.?\d*)/i, // PHP 3200.50
    /AMOUNT[:\s]+([\d,]+\.?\d*)/i, // AMOUNT: 3,200.50
    /TOTAL[:\s]+([\d,]+\.?\d*)/i, // TOTAL: 3,200.50
    /DUE[:\s]+([\d,]+\.?\d*)/i, // DUE: 3,200.50
    /([\d,]{4,}\.?\d{0,2})/, // fallback: any 4+ digit number
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const cleaned = match[1].replace(/,/g, "");
      const value = parseFloat(cleaned);
      if (!isNaN(value) && value > 0 && value < 1_000_000) {
        return value;
      }
    }
  }
  return null;
}

/**
 * Parse due date — looks for common date formats used in PH bills
 * e.g. "JUN 10, 2025", "10/06/2025", "June 10, 2025", "2025-06-10"
 */
function parseDueDate(text: string): string | null {
  const MONTHS: Record<string, number> = {
    jan: 0,
    feb: 1,
    mar: 2,
    apr: 3,
    may: 4,
    jun: 5,
    jul: 6,
    aug: 7,
    sep: 8,
    oct: 9,
    nov: 10,
    dec: 11,
    january: 0,
    february: 1,
    march: 2,
    april: 3,
    june: 5,
    july: 6,
    august: 7,
    september: 8,
    october: 9,
    november: 10,
    december: 11,
  };

  // Look for "DUE DATE" label area first
  const dueDateSection = text.match(
    /(?:due\s*date|payment\s*due|pay\s*before|due\s*on)[:\s]*([^\n]{1,30})/i,
  );
  const searchText = dueDateSection ? dueDateSection[1] : text;

  // Pattern: "JUN 10, 2025" or "June 10, 2025"
  const monthNamePattern =
    /(\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*)\s+(\d{1,2})[,\s]+(\d{4})/i;
  const match1 =
    searchText.match(monthNamePattern) ?? text.match(monthNamePattern);
  if (match1) {
    const month = MONTHS[match1[1].toLowerCase().slice(0, 3)];
    const day = parseInt(match1[2]);
    const year = parseInt(match1[3]);
    if (month !== undefined && day > 0 && day <= 31 && year > 2020) {
      return toISO(year, month, day);
    }
  }

  // Pattern: "MM/DD/YYYY" or "DD/MM/YYYY"
  const slashPattern = /(\d{1,2})\/(\d{1,2})\/(\d{4})/;
  const match2 = searchText.match(slashPattern) ?? text.match(slashPattern);
  if (match2) {
    const a = parseInt(match2[1]);
    const b = parseInt(match2[2]);
    const year = parseInt(match2[3]);
    // Assume MM/DD if first part <= 12, else DD/MM
    const month = a <= 12 ? a - 1 : b - 1;
    const day = a <= 12 ? b : a;
    if (day > 0 && day <= 31 && year > 2020) {
      return toISO(year, month, day);
    }
  }

  // Pattern: ISO "2025-06-10"
  const isoPattern = /(\d{4})-(\d{2})-(\d{2})/;
  const match3 = searchText.match(isoPattern) ?? text.match(isoPattern);
  if (match3) {
    const year = parseInt(match3[1]);
    const month = parseInt(match3[2]) - 1;
    const day = parseInt(match3[3]);
    if (year > 2020 && month >= 0 && month < 12 && day > 0 && day <= 31) {
      return toISO(year, month, day);
    }
  }

  return null;
}

/**
 * Parse biller name — looks for known PH billers first,
 * then falls back to the first meaningful line of text.
 */
function parseBillerName(text: string): string | null {
  const KNOWN_BILLERS = [
    "Meralco",
    "Manila Electric",
    "VECO",
    "CEBECO",
    "Manila Water",
    "Maynilad",
    "LWUA",
    "PLDT",
    "Globe",
    "Smart",
    "Sun",
    "Dito",
    "Sky",
    "Cignal",
    "G-Sat",
    "Converge",
    "Eastern Telecoms",
    "SSS",
    "PhilHealth",
    "Pag-IBIG",
    "HDMF",
    "Malayan",
    "Prudential",
    "AXA",
    "Sunlife",
    "Meralco",
    "BENECO",
    "NEECO",
  ];

  for (const biller of KNOWN_BILLERS) {
    if (text.toLowerCase().includes(biller.toLowerCase())) {
      return biller;
    }
  }

  // Fallback: return the first non-empty, non-numeric line
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 3);
  for (const line of lines) {
    if (!/^\d/.test(line) && /[a-zA-Z]/.test(line)) {
      return line.slice(0, 40); // cap at 40 chars
    }
  }

  return null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toISO(year: number, month: number, day: number): string {
  const d = new Date(year, month, day);
  return d.toISOString().split("T")[0];
}
