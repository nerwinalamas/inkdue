import Header from "@/components/header";
import { useBills } from "@/hooks/use-bills";
import { Bill } from "@/lib/database";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const CATEGORY_ICONS: Record<string, any> = {
  electricity: "flash-outline",
  water: "water-outline",
  internet: "wifi-outline",
  mobile: "phone-portrait-outline",
  rent: "home-outline",
  other: "receipt-outline",
};

export default function HistoryScreen() {
  const { bills, refresh } = useBills();

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <Header title="History" subtitle="Review your past bills" />

        {/* Bill list */}
        <View className="px-5 gap-3">
          {bills.length === 0 ? (
            <View className="items-center py-16">
              <Ionicons name="file-tray-outline" size={48} color="#D1D5DB" />
              <Text className="text-gray-400 mt-3 text-base">
                Walang bills dito.
              </Text>
            </View>
          ) : (
            bills.map((bill: Bill) => {
              const icon =
                CATEGORY_ICONS[bill.category] ?? CATEGORY_ICONS.other;

              return (
                <View
                  key={bill.id}
                  className="bg-white rounded-2xl p-4 flex-row items-center"
                  style={{ elevation: 1 }}
                >
                  <View className="w-11 h-11 rounded-xl items-center justify-center mr-3 bg-indigo-50">
                    <Ionicons name={icon} size={22} color="#4F46E5" />
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
                    <Text className="font-bold text-base text-gray-900">
                      ₱
                      {bill.amount.toLocaleString("en-PH", {
                        minimumFractionDigits: 2,
                      })}
                    </Text>
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
