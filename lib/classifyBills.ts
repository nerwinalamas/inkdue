import { Bill } from "@/lib/database";

export function classifyBills(unpaidBills: Bill[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const overdue: Bill[] = [];
  const upcoming: Bill[] = [];

  for (const bill of unpaidBills) {
    const due = new Date(bill.due_date);
    due.setHours(0, 0, 0, 0);
    if (due < today) overdue.push(bill);
    else upcoming.push(bill);
  }

  return { overdue, upcoming };
}
