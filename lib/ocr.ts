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
 * Parse amount — priority order:
 * 1. Labeled total (Total Amount Due, Please Pay, etc.)
 * 2. Largest peso sign + decimal amount (e.g. ₱ 3,364.86)
 * 3. Fallback: largest number with 2 decimal places in bill range
 *
 * Avoids meter numbers/account numbers by requiring decimals
 * or an explicit label keyword.
 */
function parseAmount(text: string): number | null {
  // Step 1 — labeled total lines (highest confidence)
  const labeledPatterns = [
    /(?:total\s+amount\s+due|amount\s+due|please\s+pay|total\s+due)[^\d]*([\d,]+\.\d{2})/i,
    /(?:total\s+amount\s+due|amount\s+due|please\s+pay|total\s+due)\s*[₱P]?\s*([\d,]+\.\d{2})/i,
  ];

  for (const pattern of labeledPatterns) {
    const match = text.match(pattern);
    if (match) {
      const value = parseFloat(match[1].replace(/,/g, ""));
      if (!isNaN(value) && value > 0 && value < 1_000_000) return value;
    }
  }

  // Step 2 — peso sign with 2 decimal places — collect ALL and return largest
  const pesoDecimalPattern = /[₱]\s*([\d,]+\.\d{2})/g;
  const pesoMatches: number[] = [];
  let m: RegExpExecArray | null;
  while ((m = pesoDecimalPattern.exec(text)) !== null) {
    const value = parseFloat(m[1].replace(/,/g, ""));
    if (!isNaN(value) && value > 0 && value < 1_000_000) {
      pesoMatches.push(value);
    }
  }
  if (pesoMatches.length > 0) {
    return Math.max(...pesoMatches);
  }

  // Step 3 — fallback: any decimal number in reasonable bill range (100–99999)
  const decimalPattern = /([\d,]+\.\d{2})/g;
  const candidates: number[] = [];
  while ((m = decimalPattern.exec(text)) !== null) {
    const value = parseFloat(m[1].replace(/,/g, ""));
    if (!isNaN(value) && value >= 100 && value < 100_000) {
      candidates.push(value);
    }
  }
  if (candidates.length > 0) {
    return Math.max(...candidates);
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

  // Pattern: "JUN 10, 2025" or "June 10, 2025" or "Oct 2021"
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
 * Parse biller name — checks known PH billers first,
 * then falls back to first meaningful text line.
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
    "BENECO",
    "NEECO",
  ];

  for (const biller of KNOWN_BILLERS) {
    if (text.toLowerCase().includes(biller.toLowerCase())) {
      return biller;
    }
  }

  // Fallback: first non-empty, non-numeric line
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 3);
  for (const line of lines) {
    if (!/^\d/.test(line) && /[a-zA-Z]/.test(line)) {
      return line.slice(0, 40);
    }
  }

  return null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toISO(year: number, month: number, day: number): string {
  const d = new Date(year, month, day);
  return d.toISOString().split("T")[0];
}
