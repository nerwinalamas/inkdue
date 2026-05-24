import Header from "@/components/header";
import { useBills } from "@/hooks/use-bills";
import { Bill } from "@/lib/database";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { SectionList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const CATEGORY_ICONS: Record<string, any> = {
  electricity: "flash-outline",
  water: "water-outline",
  internet: "wifi-outline",
  mobile: "phone-portrait-outline",
  rent: "home-outline",
  other: "receipt-outline",
};

const CATEGORY_COLORS: Record<string, { bg: string; icon: string }> = {
  electricity: { bg: "bg-yellow-50", icon: "#F59E0B" },
  water: { bg: "bg-blue-50", icon: "#3B82F6" },
  internet: { bg: "bg-purple-50", icon: "#8B5CF6" },
  mobile: { bg: "bg-green-50", icon: "#10B981" },
  rent: { bg: "bg-orange-50", icon: "#F97316" },
  other: { bg: "bg-gray-100", icon: "#6B7280" },
};

function groupBillsByMonth(bills: Bill[]) {
  const groups: Record<string, Bill[]> = {};
  for (const bill of bills) {
    const key = new Date(bill.due_date).toLocaleDateString("en-PH", {
      month: "long",
      year: "numeric",
    });
    if (!groups[key]) groups[key] = [];
    groups[key].push(bill);
  }
  return Object.entries(groups).map(([title, data]) => ({ title, data }));
}

export default function HistoryScreen() {
  const { bills, refresh } = useBills();

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const sections = groupBillsByMonth(bills);

  return (
    <SafeAreaView className="flex-1 bg-[#F2F2F7]">
      <SectionList
        sections={sections}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 48 }}
        stickySectionHeadersEnabled={true}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={
          <Header title="History" subtitle="Review your past bills" />
        }
        ListEmptyComponent={
          <View className="items-center py-24">
            <View className="w-20 h-20 rounded-full bg-white items-center justify-center mb-4 shadow-sm">
              <Ionicons name="file-tray-outline" size={36} color="#C7C7CC" />
            </View>
            <Text className="text-[17px] font-semibold text-[#1C1C1E] mb-1">
              No Bills Yet
            </Text>
            <Text className="text-[15px] text-[#8E8E93]">
              Your bill history will appear here.
            </Text>
          </View>
        }
        renderSectionHeader={({ section: { title, data } }) => {
          const total = data.reduce((sum, b) => sum + b.amount, 0);
          return (
            <View className="flex-row items-center justify-between px-5 py-2 bg-[#F2F2F7]">
              <Text className="text-[13px] font-semibold text-[#8E8E93] uppercase tracking-widest">
                {title}
              </Text>
              <Text className="text-[13px] font-medium text-[#8E8E93]">
                ₱{total.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
              </Text>
            </View>
          );
        }}
        renderItem={({ item: bill, index, section }) => {
          const icon = CATEGORY_ICONS[bill.category] ?? CATEGORY_ICONS.other;
          const colors =
            CATEGORY_COLORS[bill.category] ?? CATEGORY_COLORS.other;
          const isFirst = index === 0;
          const isLast = index === section.data.length - 1;
          const isOnly = section.data.length === 1;

          const borderRadius = isOnly
            ? "rounded-2xl"
            : isFirst
              ? "rounded-t-2xl"
              : isLast
                ? "rounded-b-2xl"
                : "";

          return (
            <View className="px-5">
              <View
                className={`bg-white ${borderRadius} px-4 flex-row items-center`}
                style={{ minHeight: 68 }}
              >
                {/* Icon */}
                <View
                  className={`w-10 h-10 rounded-full ${colors.bg} items-center justify-center mr-3`}
                >
                  <Ionicons name={icon} size={20} color={colors.icon} />
                </View>

                {/* Details */}
                <View className="flex-1 py-3">
                  <Text
                    className="text-[17px] font-medium text-[#1C1C1E]"
                    numberOfLines={1}
                  >
                    {bill.biller_name}
                  </Text>
                  <Text className="text-[13px] text-[#8E8E93] mt-0.5">
                    Due{" "}
                    {new Date(bill.due_date).toLocaleDateString("en-PH", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </Text>
                </View>

                {/* Amount */}
                <Text className="text-[17px] font-semibold text-[#1C1C1E] ml-3">
                  ₱
                  {bill.amount.toLocaleString("en-PH", {
                    minimumFractionDigits: 2,
                  })}
                </Text>
              </View>

              {/* iOS-style inset divider — hide after last item */}
              {!isLast && (
                <View className="bg-white">
                  <View className="ml-17 h-[0.5px] bg-[#C6C6C8]" />
                </View>
              )}
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}
