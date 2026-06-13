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
  source: "manual" | "camera" | "gallery" | null;
  notes: string | null;
  created_at: string;
  notification_id: string | null;
};

export type NewBill = Omit<Bill, "id" | "created_at">;

// ─── Migrations ───────────────────────────────────────────────────────────────

const MIGRATIONS: { name: string; sql: string }[] = [
  // Add new migrations here — never edit or delete existing ones
  {
    name: "001_add_notes",
    sql: "ALTER TABLE bills ADD COLUMN notes TEXT",
  },
  {
    name: "002_add_source",
    sql: "ALTER TABLE bills ADD COLUMN source TEXT",
  },
  {
    name: "003_add_notification_settings",
    sql: `CREATE TABLE IF NOT EXISTS notification_settings (
      id                  INTEGER PRIMARY KEY DEFAULT 1,
      bill_reminders      INTEGER NOT NULL DEFAULT 1,
      overdue_alerts      INTEGER NOT NULL DEFAULT 1,
      remind_days_before  INTEGER NOT NULL DEFAULT 3
    )`,
  },
];

function runMigrations() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS migrations (
      id     INTEGER PRIMARY KEY AUTOINCREMENT,
      name   TEXT    NOT NULL UNIQUE,
      run_at TEXT    NOT NULL DEFAULT (datetime('now'))
    );
  `);

  for (const migration of MIGRATIONS) {
    const already = db.getFirstSync(
      "SELECT id FROM migrations WHERE name = ?",
      [migration.name],
    );
    if (!already) {
      try {
        db.execSync(migration.sql);
      } catch (e) {
        // Column/table may already exist on fresh installs — safe to ignore
        console.warn(`Migration "${migration.name}" skipped:`, e);
      }
      db.runSync("INSERT INTO migrations (name) VALUES (?)", [migration.name]);
    }
  }
}

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
      notes           TEXT,
      source          TEXT,
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

  runMigrations();
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
    `INSERT INTO bills (biller_name, amount, due_date, status, category, image_uri, notes, source, notification_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      bill.biller_name,
      bill.amount,
      bill.due_date,
      bill.status ?? "unpaid",
      bill.category ?? "other",
      bill.image_uri ?? null,
      bill.notes ?? null,
      bill.source ?? null,
      bill.notification_id ?? null,
    ],
  );
  return result.lastInsertRowId;
}

export function updateBill(id: number, bill: Partial<NewBill>): void {
  const keys = Object.keys(bill);
  if (keys.length === 0) return;

  const fields = keys.map((key) => `${key} = ?`).join(", ");

  // Explicitly coerce each value: null/undefined → null, boolean → 0/1,
  // everything else passes through. This prevents Android's Kotlin bridge
  // from choking on JS null objects or unexpected types.
  const values: SQLite.SQLiteBindValue[] = [
    ...keys.map((key) => {
      const v = (bill as Record<string, unknown>)[key];
      if (v === null || v === undefined) return null;
      if (typeof v === "boolean") return v ? 1 : 0;
      return v as SQLite.SQLiteBindValue;
    }),
    id,
  ];

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
