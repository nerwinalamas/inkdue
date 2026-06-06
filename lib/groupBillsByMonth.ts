import { Bill } from "@/lib/database";

export function groupBillsByMonth(bills: Bill[]) {
  const groups: Record<string, Bill[]> = {};
  for (const bill of bills) {
    const key = new Date(bill.due_date).toLocaleDateString("en-PH", {
      month: "long",
      year: "numeric",
    });
    if (!groups[key]) groups[key] = [];
    groups[key].push(bill);
  }
  return Object.entries(groups).map(([title, data]) => ({ title, data }));
}
