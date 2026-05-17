import { useBills } from "@/hooks/use-bills";
import { Bill } from "@/lib/database";
import { cancelBillReminders } from "@/lib/notifications";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const CATEGORY_ICONS: Record<string, any> = {
  electricity: "flash-outline",
  water: "water-outline",
  internet: "wifi-outline",
  mobile: "phone-portrait-outline",
  rent: "home-outline",
  other: "receipt-outline",
};

type Filter = "all" | "unpaid" | "paid";

export default function HistoryScreen() {
  const { bills, markAsPaid, markAsUnpaid, deleteBill, refresh } = useBills();
  const [filter, setFilter] = useState<Filter>("all");

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const filtered = bills.filter((b) => {
    if (filter === "all") return true;
    return b.status === filter;
  });

  async function handleTogglePaid(bill: Bill) {
    if (bill.status === "paid") {
      markAsUnpaid(bill.id);
    } else {
      // Cancel notifications when marking as paid
      await cancelBillReminders(bill.notification_id);
      markAsPaid(bill.id);
    }
  }

  function handleDelete(bill: Bill) {
    Alert.alert(
      "Delete bill",
      `Tanggalin ang bill para sa ${bill.biller_name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await cancelBillReminders(bill.notification_id);
            deleteBill(bill.id);
          },
        },
      ],
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Header */}
        <View className="px-5 pt-6 pb-4">
          <Text className="text-2xl font-bold text-gray-900">History</Text>
          <Text className="text-sm text-gray-500 mt-1">
            {bills.length} bill{bills.length !== 1 ? "s" : ""} total
          </Text>
        </View>

        {/* Filter tabs */}
        <View className="flex-row mx-5 mb-5 bg-gray-100 rounded-xl p-1">
          {(["all", "unpaid", "paid"] as Filter[]).map((f) => (
            <TouchableOpacity
              key={f}
              className={`flex-1 py-2 rounded-lg items-center ${filter === f ? "bg-white" : ""}`}
              onPress={() => setFilter(f)}
              activeOpacity={0.7}
              style={filter === f ? { elevation: 1 } : undefined}
            >
              <Text
                className={`text-sm font-medium capitalize ${filter === f ? "text-gray-900" : "text-gray-500"}`}
              >
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Bill list */}
        <View className="px-5 gap-3">
          {filtered.length === 0 ? (
            <View className="items-center py-16">
              <Ionicons name="file-tray-outline" size={48} color="#D1D5DB" />
              <Text className="text-gray-400 mt-3 text-base">
                Walang bills dito.
              </Text>
            </View>
          ) : (
            filtered.map((bill: Bill) => {
              const icon =
                CATEGORY_ICONS[bill.category] ?? CATEGORY_ICONS.other;
              const isPaid = bill.status === "paid";

              return (
                <View
                  key={bill.id}
                  className="bg-white rounded-2xl p-4 flex-row items-center"
                  style={{ elevation: 1 }}
                >
                  <View
                    className={`w-11 h-11 rounded-xl items-center justify-center mr-3 ${isPaid ? "bg-green-50" : "bg-indigo-50"}`}
                  >
                    <Ionicons
                      name={icon}
                      size={22}
                      color={isPaid ? "#16A34A" : "#4F46E5"}
                    />
                  </View>

                  <View className="flex-1">
                    <Text className="text-gray-900 font-semibold text-base">
                      {bill.biller_name}
                    </Text>
                    <Text className="text-gray-400 text-xs mt-0.5">
                      {new Date(bill.due_date).toLocaleDateString("en-PH", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </Text>
                  </View>

                  <View className="items-end gap-1 mr-2">
                    <Text
                      className={`font-bold text-base ${isPaid ? "text-gray-400" : "text-gray-900"}`}
                    >
                      ₱
                      {bill.amount.toLocaleString("en-PH", {
                        minimumFractionDigits: 2,
                      })}
                    </Text>
                    <View
                      className={`rounded-full px-2 py-0.5 ${isPaid ? "bg-green-100" : "bg-indigo-100"}`}
                    >
                      <Text
                        className={`text-xs font-medium ${isPaid ? "text-green-600" : "text-indigo-600"}`}
                      >
                        {isPaid ? "Paid" : "Unpaid"}
                      </Text>
                    </View>
                  </View>

                  <View className="gap-2">
                    <TouchableOpacity
                      onPress={() => handleTogglePaid(bill)}
                      className={`w-8 h-8 rounded-full items-center justify-center ${isPaid ? "bg-gray-100" : "bg-green-100"}`}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={isPaid ? "refresh-outline" : "checkmark"}
                        size={16}
                        color={isPaid ? "#6B7280" : "#16A34A"}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDelete(bill)}
                      className="w-8 h-8 rounded-full items-center justify-center bg-red-50"
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={16}
                        color="#DC2626"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
