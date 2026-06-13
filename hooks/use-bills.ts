import {
  Bill,
  NewBill,
  addBill,
  deleteAllBills,
  deleteBill,
  getBills,
  getTotalUnpaid,
  getUnpaidBills,
  markAsPaid,
  markAsUnpaid,
  updateBill,
} from "@/lib/database";
import { useCallback, useEffect, useState } from "react";

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

  function handleAddBill(bill: NewBill): number {
    const id = addBill(bill);
    refresh();
    return id;
  }

  function handleUpdateBill(id: number, bill: Partial<NewBill>) {
    updateBill(id, bill);
    refresh();
  }

  function handleMarkAsPaid(id: number) {
    markAsPaid(id);
    refresh();
  }

  function handleMarkAsUnpaid(id: number) {
    markAsUnpaid(id);
    refresh();
  }

  function handleDeleteBill(id: number) {
    deleteBill(id);
    refresh();
  }

  function handleDeleteAllBills() {
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
