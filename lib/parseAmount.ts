/**
 * Parse amount — priority order:
 * 1. Labeled total (Total Amount Due, Please Pay, etc.)
 * 2. Largest peso sign + decimal amount (e.g. ₱ 3,364.86)
 * 3. Fallback: largest number with 2 decimal places in bill range
 *
 * Avoids meter numbers/account numbers by requiring decimals
 * or an explicit label keyword.
 */
export function parseAmount(text: string): number | null {
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
