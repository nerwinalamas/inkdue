import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// ─── Setup ────────────────────────────────────────────────────────────────────

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("bill-reminders", {
      name: "Bill Reminders",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#4F46E5",
    });
  }

  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

// ─── Schedule ─────────────────────────────────────────────────────────────────

/**
 * Schedule reminders for a bill: 3 days before, 1 day before, and day-of.
 * Returns array of notification IDs.
 */
export async function scheduleBillReminders(
  billId: number,
  billerName: string,
  amount: number,
  dueDateISO: string,
): Promise<string[]> {
  const dueDate = new Date(dueDateISO);
  const notifIds: string[] = [];

  const reminders = [
    {
      daysBefore: 3,
      title: "Bill due in 3 days",
      body: `${billerName} — ₱${amount.toLocaleString("en-PH", { minimumFractionDigits: 2 })} due in 3 days.`,
    },
    {
      daysBefore: 1,
      title: "Bill due tomorrow!",
      body: `${billerName} — ₱${amount.toLocaleString("en-PH", { minimumFractionDigits: 2 })} is due tomorrow.`,
    },
    {
      daysBefore: 0,
      title: "Bill due today!",
      body: `${billerName} — ₱${amount.toLocaleString("en-PH", { minimumFractionDigits: 2 })} is due today. Don't forget to pay!`,
    },
  ];

  for (const reminder of reminders) {
    const triggerDate = new Date(dueDate);
    triggerDate.setDate(triggerDate.getDate() - reminder.daysBefore);
    triggerDate.setHours(9, 0, 0, 0); // 9AM reminder

    // Only schedule if trigger date is in the future
    if (triggerDate > new Date()) {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: reminder.title,
          body: reminder.body,
          data: { billId },
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: triggerDate,
        },
      });
      notifIds.push(id);
    }
  }

  return notifIds;
}

// ─── Cancel ───────────────────────────────────────────────────────────────────

/**
 * Cancel scheduled notifications for a bill.
 * Pass the notification_id field from the DB (comma-separated IDs).
 */
export async function cancelBillReminders(
  notificationId: string | null,
): Promise<void> {
  if (!notificationId) return;
  const ids = notificationId.split(",");
  for (const id of ids) {
    await Notifications.cancelScheduledNotificationAsync(id.trim());
  }
}
