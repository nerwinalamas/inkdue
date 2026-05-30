import { formatDateParts } from "./formatDateParts";

/**
 * Parse due date — looks for common date formats used in PH bills
 * e.g. "JUN 10, 2025", "10/06/2025", "June 10, 2025", "2025-06-10"
 */
export function parseDueDate(text: string): string | null {
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
      return formatDateParts(year, month, day);
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
      return formatDateParts(year, month, day);
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
      return formatDateParts(year, month, day);
    }
  }

  return null;
}
