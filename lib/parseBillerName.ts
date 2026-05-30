/**
 * Parse biller name — checks known PH billers first,
 * then falls back to first meaningful text line.
 */
export function parseBillerName(text: string): string | null {
  const KNOWN_BILLERS = [
    "Meralco",
    // "Manila Electric",
    // "VECO",
    // "CEBECO",
    // "Manila Water",
    // "Maynilad",
    // "LWUA",
    // "PLDT",
    // "Globe",
    // "Smart",
    // "Sun",
    // "Dito",
    // "Sky",
    // "Cignal",
    // "G-Sat",
    // "Converge",
    // "Eastern Telecoms",
    // "SSS",
    // "PhilHealth",
    // "Pag-IBIG",
    // "HDMF",
    // "Malayan",
    // "Prudential",
    // "AXA",
    // "Sunlife",
    // "BENECO",
    // "NEECO",
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
