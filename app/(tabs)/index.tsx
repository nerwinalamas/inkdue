import { BillRow } from "@/components/bill-row";
import Header from "@/components/header";
import { useBills } from "@/hooks/use-bills";
import { classifyBills } from "@/lib/classifyBills";
import { getBillPosition } from "@/lib/getBillPosition";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function SectionHeader({ title }: { title: string }) {
  return (
    <Text className="text-[13px] font-semibold text-[#8E8E93] uppercase tracking-widest px-5 mb-2">
      {title}
    </Text>
  );
}

export default function DashboardScreen() {
  const { unpaidBills, totalUnpaid, loading, refresh } = useBills();

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-[#F2F2F7] items-center justify-center">
        <ActivityIndicator size="large" color="#0A84FF" />
      </SafeAreaView>
    );
  }

  const { overdue, upcoming } = classifyBills(unpaidBills);
  const dueSoonCount = upcoming.filter((b) => {
    const diff = Math.round(
      (new Date(b.due_date).getTime() - new Date().setHours(0, 0, 0, 0)) /
        86400000,
    );
    return diff <= 7;
  }).length;

  return (
    <SafeAreaView className="flex-1 bg-[#F2F2F7]">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 48 }}
      >
        <Header
          title="Inkdue"
          subtitle="Track your bills, never miss a due date."
        />

        {/* Summary cards */}
        <View className="flex-row gap-3 px-5 mb-6">
          <View
            className="flex-1 bg-white rounded-2xl px-5 py-4"
            style={{ borderWidth: 0.5, borderColor: "#E5E5EA" }}
          >
            <Text className="text-[12px] text-[#8E8E93] uppercase tracking-widest mb-3">
              Unpaid
            </Text>
            <Text
              className="text-[32px] font-bold text-[#E24B4A]"
              style={{ letterSpacing: -1 }}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              ₱
              {totalUnpaid.toLocaleString("en-PH", {
                minimumFractionDigits: 2,
              })}
            </Text>
            <Text className="text-[13px] text-[#C7C7CC] mt-1">
              {unpaidBills.length} {unpaidBills.length === 1 ? "bill" : "bills"}
            </Text>
          </View>

          <View
            className="flex-1 bg-white rounded-2xl px-5 py-4"
            style={{ borderWidth: 0.5, borderColor: "#E5E5EA" }}
          >
            <Text className="text-[12px] text-[#8E8E93] uppercase tracking-widest mb-3">
              This week
            </Text>
            <Text
              className="text-[32px] font-bold text-[#1C1C1E]"
              style={{ letterSpacing: -1 }}
            >
              {dueSoonCount}
            </Text>
            <Text className="text-[13px] text-[#C7C7CC] mt-1">
              {dueSoonCount === 1 ? "bill" : "bills"} due
            </Text>
          </View>
        </View>

        {/* Empty state */}
        {unpaidBills.length === 0 && (
          <View className="items-center py-24 px-8">
            <View className="w-20 h-20 rounded-full bg-white items-center justify-center mb-4">
              <Ionicons
                name="checkmark-circle-outline"
                size={36}
                color="#C7C7CC"
              />
            </View>
            <Text className="text-[17px] font-semibold text-[#1C1C1E] mb-1">
              All clear!
            </Text>
            <Text className="text-[15px] text-[#8E8E93] text-center">
              No unpaid bills. Tap + to add one.
            </Text>
          </View>
        )}

        {/* Overdue */}
        {overdue.length > 0 && (
          <View className="mb-6">
            <SectionHeader title="Overdue" />
            {overdue.map((bill, index) => (
              <BillRow
                key={bill.id}
                bill={bill}
                position={getBillPosition(index, overdue.length)}
                showDivider={index < overdue.length - 1}
                source="dashboard"
              />
            ))}
          </View>
        )}

        {/* Upcoming */}
        {upcoming.length > 0 && (
          <View className="mb-6">
            <SectionHeader title="Upcoming" />
            {upcoming.map((bill, index) => (
              <BillRow
                key={bill.id}
                bill={bill}
                position={getBillPosition(index, upcoming.length)}
                showDivider={index < upcoming.length - 1}
                source="dashboard"
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
