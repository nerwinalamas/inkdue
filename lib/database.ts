import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("inkdue.db");

// ─── Types ───────────────────────────────────────────────────────────────────

export type BillStatus = "unpaid" | "paid";

export type Bill = {
  id: number;
  biller_name: string;
  amount: number;
  due_date: string; // ISO string: "2025-06-10"
  status: BillStatus;
  category: string;
  image_uri: string | null;
  created_at: string;
  notification_id: string | null;
};

export type NewBill = Omit<Bill, "id" | "created_at">;

// ─── Init ─────────────────────────────────────────────────────────────────────

export function initDatabase() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS bills (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      biller_name     TEXT    NOT NULL,
      amount          REAL    NOT NULL,
      due_date        TEXT    NOT NULL,
      status          TEXT    NOT NULL DEFAULT 'unpaid',
      category        TEXT    NOT NULL DEFAULT 'other',
      image_uri       TEXT,
      created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
      notification_id TEXT
    );

    CREATE TABLE IF NOT EXISTS payments (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      bill_id     INTEGER NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
      paid_amount REAL    NOT NULL,
      paid_date   TEXT    NOT NULL DEFAULT (datetime('now')),
      note        TEXT
    );
  `);
}

// ─── Bills CRUD ───────────────────────────────────────────────────────────────

export function getBills(): Bill[] {
  return db.getAllSync<Bill>("SELECT * FROM bills ORDER BY due_date ASC");
}

export function getUnpaidBills(): Bill[] {
  return db.getAllSync<Bill>(
    "SELECT * FROM bills WHERE status = 'unpaid' ORDER BY due_date ASC",
  );
}

export function getBillById(id: number): Bill | null {
  return (
    db.getFirstSync<Bill>("SELECT * FROM bills WHERE id = ?", [id]) ?? null
  );
}

export function addBill(bill: NewBill): number {
  const result = db.runSync(
    `INSERT INTO bills (biller_name, amount, due_date, status, category, image_uri, notification_id)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      bill.biller_name,
      bill.amount,
      bill.due_date,
      bill.status ?? "unpaid",
      bill.category ?? "other",
      bill.image_uri ?? null,
      bill.notification_id ?? null,
    ],
  );
  return result.lastInsertRowId;
}

export function updateBill(id: number, bill: Partial<NewBill>): void {
  const fields = Object.keys(bill)
    .map((key) => `${key} = ?`)
    .join(", ");
  const values = [...Object.values(bill), id];
  db.runSync(`UPDATE bills SET ${fields} WHERE id = ?`, values);
}

export function markAsPaid(id: number): void {
  db.runSync("UPDATE bills SET status = 'paid' WHERE id = ?", [id]);
}

export function markAsUnpaid(id: number): void {
  db.runSync("UPDATE bills SET status = 'unpaid' WHERE id = ?", [id]);
}

export function deleteBill(id: number): void {
  db.runSync("DELETE FROM bills WHERE id = ?", [id]);
}

export function deleteAllBills(): void {
  db.runSync("DELETE FROM bills");
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export function getTotalUnpaid(): number {
  const result = db.getFirstSync<{ total: number }>(
    "SELECT COALESCE(SUM(amount), 0) as total FROM bills WHERE status = 'unpaid'",
  );
  return result?.total ?? 0;
}
