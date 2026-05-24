export function toISODate(date: Date) {
  return date.toISOString().split("T")[0]; // "2025-06-10"
}
