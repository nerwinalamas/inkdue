import NavBar from "@/components/nav-bar";
import { CATEGORIES } from "@/lib/constant";
import {
  Bill,
  BillStatus,
  deleteBill,
  getBillById,
  markAsPaid,
  markAsUnpaid,
} from "@/lib/database";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
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

const CATEGORY_COLORS: Record<string, { bg: string; icon: string }> = {
  electricity: { bg: "bg-yellow-50", icon: "#F59E0B" },
  water: { bg: "bg-blue-50", icon: "#3B82F6" },
  internet: { bg: "bg-purple-50", icon: "#8B5CF6" },
  mobile: { bg: "bg-green-50", icon: "#10B981" },
  rent: { bg: "bg-orange-50", icon: "#F97316" },
  other: { bg: "bg-gray-100", icon: "#6B7280" },
};

const STATUS_CONFIG: Record<
  BillStatus,
  { label: string; bg: string; text: string; icon: string; iconColor: string }
> = {
  paid: {
    label: "Paid",
    bg: "bg-green-50",
    text: "text-green-600",
    icon: "checkmark-circle",
    iconColor: "#16A34A",
  },
  unpaid: {
    label: "Unpaid",
    bg: "bg-red-50",
    text: "text-red-500",
    icon: "ellipse-outline",
    iconColor: "#EF4444",
  },
};

function InfoRow({
  icon,
  label,
  value,
  isLast = false,
}: {
  icon: string;
  label: string;
  value: string;
  isLast?: boolean;
}) {
  return (
    <>
      <View
        className="px-4 py-3 flex-row items-center"
        style={{ minHeight: 56 }}
      >
        <View className="w-8 h-8 rounded-lg bg-gray-100 items-center justify-center mr-3">
          <Ionicons name={icon as any} size={16} color="#6C6C70" />
        </View>
        <View className="flex-1">
          <Text className="text-[11px] text-[#8E8E93] font-medium mb-0.5">
            {label}
          </Text>
          <Text className="text-[17px] text-[#1C1C1E]">{value}</Text>
        </View>
      </View>
      {!isLast && <View className="ml-15 h-[0.5px] bg-[#C6C6C8]" />}
    </>
  );
}

export default function BillDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [bill, setBill] = useState<Bill | null>(null);

  const load = useCallback(() => {
    if (id) setBill(getBillById(Number(id)));
  }, [id]);

  useFocusEffect(load);

  if (!bill) {
    return (
      <SafeAreaView className="flex-1 bg-[#F2F2F7] items-center justify-center">
        <Text className="text-[#8E8E93] text-[17px]">Bill not found.</Text>
      </SafeAreaView>
    );
  }

  const icon = CATEGORY_ICONS[bill.category] ?? CATEGORY_ICONS.other;
  const colors = CATEGORY_COLORS[bill.category] ?? CATEGORY_COLORS.other;
  const status = STATUS_CONFIG[bill.status] ?? STATUS_CONFIG.unpaid;
  const categoryLabel =
    CATEGORIES.find((c) => c.id === bill.category)?.label ?? bill.category;

  const dueDateFormatted = new Date(bill.due_date).toLocaleDateString("en-PH", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  function handleTogglePaid() {
    if (bill!.status === "paid") {
      markAsUnpaid(bill!.id);
    } else {
      markAsPaid(bill!.id);
    }
    load();
  }

  function handleDelete() {
    Alert.alert(
      "Delete Bill",
      `Are you sure you want to delete the bill for ${bill!.biller_name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteBill(bill!.id);
            router.push("/(tabs)/history");
          },
        },
      ],
    );
  }

  const isPaid = bill.status === "paid";

  return (
    <SafeAreaView className="flex-1 bg-[#F2F2F7]">
      <NavBar
        title="Bill Details"
        left={{ label: "Back", onPress: () => router.push("/(tabs)/history") }}
        right={{
          label: "Edit",
          onPress: () => router.push(`/(tabs)/bill/edit/${bill.id}`),
        }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 48 }}
      >
        {/* Hero amount card */}
        <View className="mx-5 mt-2 mb-6 bg-white rounded-2xl px-6 py-6 items-center">
          <View
            className={`w-16 h-16 rounded-full ${colors.bg} items-center justify-center mb-3`}
          >
            <Ionicons name={icon} size={32} color={colors.icon} />
          </View>
          <Text className="text-[22px] font-semibold text-[#1C1C1E] mb-1">
            {bill.biller_name}
          </Text>
          <Text className="text-[34px] font-bold text-[#1C1C1E] mb-3">
            ₱
            {bill.amount.toLocaleString("en-PH", {
              minimumFractionDigits: 2,
            })}
          </Text>
          {/* Status badge */}
          <View
            className={`flex-row items-center gap-1.5 px-3 py-1.5 rounded-full ${status.bg}`}
          >
            <Ionicons
              name={status.icon as any}
              size={14}
              color={status.iconColor}
            />
            <Text className={`text-[13px] font-semibold ${status.text}`}>
              {status.label}
            </Text>
          </View>
        </View>

        {/* Details card */}
        <View className="mx-5 mb-4">
          <Text className="text-[13px] font-semibold text-[#8E8E93] uppercase tracking-widest mb-2 ml-1">
            Details
          </Text>
          <View className="bg-white rounded-2xl overflow-hidden">
            <InfoRow
              icon="calendar-outline"
              label="Due Date"
              value={dueDateFormatted}
            />
            <InfoRow
              icon="pricetag-outline"
              label="Category"
              value={categoryLabel}
            />
            <InfoRow
              icon="receipt-outline"
              label="Status"
              value={status.label}
              isLast
            />
          </View>
        </View>

        {/* Mark as paid / unpaid */}
        <View className="mx-5 mb-3">
          <TouchableOpacity
            className={`rounded-2xl py-4 items-center ${isPaid ? "bg-white" : "bg-[#0A84FF]"}`}
            activeOpacity={0.8}
            onPress={handleTogglePaid}
          >
            <Text
              className={`text-[17px] font-semibold ${isPaid ? "text-[#0A84FF]" : "text-white"}`}
            >
              {isPaid ? "Mark as Unpaid" : "Mark as Paid"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Delete */}
        <View className="mx-5">
          <TouchableOpacity
            className="bg-white rounded-2xl py-4 items-center"
            activeOpacity={0.7}
            onPress={handleDelete}
          >
            <Text className="text-[17px] font-semibold text-red-500">
              Delete Bill
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
