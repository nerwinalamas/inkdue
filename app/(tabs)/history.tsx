import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ALL_BILLS = [
  {
    id: "1",
    biller: "Meralco",
    amount: 3200.5,
    dueDate: "2025-06-10",
    status: "unpaid",
    category: "electricity",
  },
  {
    id: "2",
    biller: "Manila Water",
    amount: 850.0,
    dueDate: "2025-06-08",
    status: "unpaid",
    category: "water",
  },
  {
    id: "3",
    biller: "PLDT Home",
    amount: 1699.0,
    dueDate: "2025-06-15",
    status: "unpaid",
    category: "internet",
  },
  {
    id: "4",
    biller: "Globe Postpaid",
    amount: 999.0,
    dueDate: "2025-05-30",
    status: "paid",
    category: "mobile",
  },
  {
    id: "5",
    biller: "Meralco",
    amount: 2980.0,
    dueDate: "2025-05-10",
    status: "paid",
    category: "electricity",
  },
];

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
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = ALL_BILLS.filter((b) => {
    if (filter === "all") return true;
    return b.status === filter;
  });

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
            All your logged bills
          </Text>
        </View>

        {/* Filter tabs */}
        <View className="flex-row mx-5 mb-5 bg-gray-100 rounded-xl p-1">
          {(["all", "unpaid", "paid"] as Filter[]).map((f) => (
            <TouchableOpacity
              key={f}
              className={`flex-1 py-2 rounded-lg items-center ${
                filter === f ? "bg-white" : ""
              }`}
              onPress={() => setFilter(f)}
              activeOpacity={0.7}
              style={filter === f ? { elevation: 1 } : undefined}
            >
              <Text
                className={`text-sm font-medium capitalize ${
                  filter === f ? "text-gray-900" : "text-gray-500"
                }`}
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
              <Text className="text-gray-400 mt-3">Walang bills dito.</Text>
            </View>
          ) : (
            filtered.map((bill) => {
              const icon =
                CATEGORY_ICONS[bill.category] ?? CATEGORY_ICONS.other;
              const isPaid = bill.status === "paid";

              return (
                <TouchableOpacity
                  key={bill.id}
                  className="bg-white rounded-2xl p-4 flex-row items-center"
                  activeOpacity={0.7}
                  style={{ elevation: 1 }}
                >
                  <View
                    className={`w-11 h-11 rounded-xl items-center justify-center mr-3 ${
                      isPaid ? "bg-green-50" : "bg-indigo-50"
                    }`}
                  >
                    <Ionicons
                      name={icon}
                      size={22}
                      color={isPaid ? "#16A34A" : "#4F46E5"}
                    />
                  </View>

                  <View className="flex-1">
                    <Text className="text-gray-900 font-semibold text-base">
                      {bill.biller}
                    </Text>
                    <Text className="text-gray-400 text-xs mt-0.5">
                      {new Date(bill.dueDate).toLocaleDateString("en-PH", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </Text>
                  </View>

                  <View className="items-end gap-1">
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
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
