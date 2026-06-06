export function getDaysLabel(dueDateStr: string): {
  label: string;
  isUrgent: boolean;
} {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDateStr);
  due.setHours(0, 0, 0, 0);

  const diff = Math.round(
    (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diff < 0) return { label: `${Math.abs(diff)}d overdue`, isUrgent: true };
  if (diff === 0) return { label: "Due today", isUrgent: true };
  if (diff === 1) return { label: "Due tomorrow", isUrgent: true };
  return { label: `${diff} days left`, isUrgent: false };
}
