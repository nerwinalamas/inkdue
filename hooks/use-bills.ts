import {
  Bill,
  NewBill,
  addBill,
  deleteAllBills,
  deleteBill,
  getBillById,
  getBills,
  getTotalUnpaid,
  getUnpaidBills,
  markAsPaid,
  markAsUnpaid,
  updateBill,
} from "@/lib/database";
import {
  cancelBillReminders,
  scheduleBillReminders,
} from "@/lib/notifications";
import * as SQLite from "expo-sqlite";
import { useCallback, useEffect, useState } from "react";

const db = SQLite.openDatabaseSync("inkdue.db");

function getNotificationSettings() {
  return db.getFirstSync<{
    bill_reminders: number;
    overdue_alerts: number;
    remind_days_before: number;
  }>("SELECT * FROM notification_settings WHERE id = 1");
}

export function useBills() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [unpaidBills, setUnpaidBills] = useState<Bill[]>([]);
  const [totalUnpaid, setTotalUnpaid] = useState(0);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setLoading(true);
    setBills(getBills());
    setUnpaidBills(getUnpaidBills());
    setTotalUnpaid(getTotalUnpaid());
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function handleAddBill(bill: NewBill): Promise<number> {
    const id = addBill(bill);

    try {
      const notifSettings = getNotificationSettings();
      if (notifSettings?.bill_reminders && bill.due_date) {
        const ids = await scheduleBillReminders(
          id,
          bill.biller_name,
          bill.amount,
          bill.due_date,
        );
        if (ids.length > 0) {
          updateBill(id, { notification_id: ids.join(",") });
        }
      }
    } catch (e) {
      console.warn("Could not schedule notifications:", e);
    }

    refresh();
    return id;
  }

  async function handleUpdateBill(id: number, bill: Partial<NewBill>) {
    const existing = getBillById(id);

    // Cancel old notifications before anything else
    if (existing?.notification_id) {
      try {
        await cancelBillReminders(existing.notification_id);
      } catch (e) {
        console.warn("Could not cancel old notifications:", e);
      }
    }

    // Compute the merged bill state so we only call updateBill once
    const mergedBillerName = bill.biller_name ?? existing?.biller_name ?? "";
    const mergedAmount = bill.amount ?? existing?.amount ?? 0;
    const mergedDueDate = bill.due_date ?? existing?.due_date ?? "";
    const mergedStatus = bill.status ?? existing?.status ?? "unpaid";

    let newNotificationId: string | null = null;

    try {
      const notifSettings = getNotificationSettings();
      if (
        notifSettings?.bill_reminders &&
        mergedDueDate &&
        mergedStatus === "unpaid"
      ) {
        const ids = await scheduleBillReminders(
          id,
          mergedBillerName,
          mergedAmount,
          mergedDueDate,
        );
        if (ids.length > 0) {
          newNotificationId = ids.join(",");
        }
      }
    } catch (e) {
      console.warn("Could not schedule notifications:", e);
    }

    // Single updateBill call — no double-write, no null object passed to Kotlin
    updateBill(id, { ...bill, notification_id: newNotificationId });

    refresh();
  }

  async function handleMarkAsPaid(id: number) {
    const bill = getBillById(id);
    if (bill?.notification_id) {
      try {
        await cancelBillReminders(bill.notification_id);
      } catch (e) {
        console.warn("Could not cancel notifications:", e);
      }
    }
    // Use a single updateBill + markAsPaid to avoid redundant writes
    updateBill(id, { notification_id: null });
    markAsPaid(id);
    refresh();
  }

  function handleMarkAsUnpaid(id: number) {
    markAsUnpaid(id);
    refresh();
  }

  async function handleDeleteBill(id: number) {
    const bill = getBillById(id);
    if (bill?.notification_id) {
      try {
        await cancelBillReminders(bill.notification_id);
      } catch (e) {
        console.warn("Could not cancel notifications:", e);
      }
    }
    deleteBill(id);
    refresh();
  }

  async function handleDeleteAllBills() {
    const allBills = getBills();
    await Promise.allSettled(
      allBills.map((b) => cancelBillReminders(b.notification_id)),
    );
    deleteAllBills();
    refresh();
  }

  return {
    bills,
    unpaidBills,
    totalUnpaid,
    loading,
    refresh,
    addBill: handleAddBill,
    updateBill: handleUpdateBill,
    markAsPaid: handleMarkAsPaid,
    markAsUnpaid: handleMarkAsUnpaid,
    deleteBill: handleDeleteBill,
    deleteAllBills: handleDeleteAllBills,
  };
}
