import { BillRow } from "@/components/bill-row";
import Header from "@/components/header";
import { useBills } from "@/hooks/use-bills";
import { getBillPosition } from "@/lib/getBillPosition";
import { groupBillsByMonth } from "@/lib/groupBillsByMonth";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { SectionList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HistoryScreen() {
  const { bills, refresh } = useBills();

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const sections = groupBillsByMonth(bills);

  return (
    <SafeAreaView className="flex-1 bg-[#F2F2F7] dark:bg-black">
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
            <View className="w-20 h-20 rounded-full bg-white dark:bg-[#1C1C1E] items-center justify-center mb-4 shadow-sm">
              <Ionicons name="file-tray-outline" size={36} color="#C7C7CC" />
            </View>
            <Text className="text-[17px] font-semibold text-[#1C1C1E] dark:text-white mb-1">
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
            <View className="flex-row items-center justify-between px-5 py-2 bg-[#F2F2F7] dark:bg-black">
              <Text className="text-[13px] font-semibold text-[#8E8E93] uppercase tracking-widest">
                {title}
              </Text>
              <Text className="text-[13px] font-medium text-[#8E8E93]">
                ₱{total.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
              </Text>
            </View>
          );
        }}
        renderItem={({ item: bill, index, section }) => (
          <BillRow
            bill={bill}
            position={getBillPosition(index, section.data.length)}
            showDivider={index < section.data.length - 1}
            source="history"
          />
        )}
      />
    </SafeAreaView>
  );
}
