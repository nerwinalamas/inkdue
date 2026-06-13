import * as SQLite from "expo-sqlite";
import { useEffect, useState } from "react";

const db = SQLite.openDatabaseSync("inkdue.db");

export type NotificationSettings = {
  billReminders: boolean;
  overdueAlerts: boolean;
  remindDaysBefore: number;
};

const DEFAULTS: NotificationSettings = {
  billReminders: true,
  overdueAlerts: true,
  remindDaysBefore: 3,
};

export function useNotificationSettings() {
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULTS);

  useEffect(() => {
    const row = db.getFirstSync<{
      bill_reminders: number;
      overdue_alerts: number;
      remind_days_before: number;
    }>("SELECT * FROM notification_settings WHERE id = 1");

    if (row) {
      setSettings({
        billReminders: !!row.bill_reminders,
        overdueAlerts: !!row.overdue_alerts,
        remindDaysBefore: row.remind_days_before,
      });
    } else {
      db.runSync(
        "INSERT INTO notification_settings (id, bill_reminders, overdue_alerts, remind_days_before) VALUES (1, 1, 1, 3)",
      );
    }
  }, []);

  function updateSettings(partial: Partial<NotificationSettings>) {
    const next = { ...settings, ...partial };
    setSettings(next);
    db.runSync(
      `INSERT OR REPLACE INTO notification_settings (id, bill_reminders, overdue_alerts, remind_days_before)
       VALUES (1, ?, ?, ?)`,
      [
        next.billReminders ? 1 : 0,
        next.overdueAlerts ? 1 : 0,
        next.remindDaysBefore,
      ],
    );
  }

  return { settings, updateSettings };
}
