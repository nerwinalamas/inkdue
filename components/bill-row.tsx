import { CATEGORY_COLORS, CATEGORY_ICONS } from "@/lib/constant";
import { Bill } from "@/lib/database";
import { getBorderRadius } from "@/lib/getBorderRadius";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export type Position = "only" | "first" | "last" | "middle";

type Props = {
  bill: Bill;
  position?: Position;
  showDivider?: boolean;
  source?: "dashboard" | "history";
};

export function BillRow({
  bill,
  position = "only",
  showDivider = false,
  source = "dashboard",
}: Props) {
  const router = useRouter();
  const icon = CATEGORY_ICONS[bill.category] ?? CATEGORY_ICONS.other;
  const colors = CATEGORY_COLORS[bill.category] ?? CATEGORY_COLORS.other;
  const isPaid = bill.status === "paid";
  const borderRadius = getBorderRadius(position);

  return (
    <View className="px-5">
      <TouchableOpacity
        activeOpacity={0.6}
        onPress={() =>
          router.push({
            pathname: "/(tabs)/bill/[id]",
            params: { id: bill.id, source },
          })
        }
        className={`bg-white dark:bg-[#1C1C1E] ${borderRadius} px-4 flex-row items-center`}
        style={{ minHeight: 68 }}
      >
        <View
          className={`w-10 h-10 rounded-full ${colors.bg} items-center justify-center mr-3`}
        >
          <Ionicons name={icon} size={20} color={colors.icon} />
        </View>

        <View className="flex-1 py-3">
          <Text
            className="text-[17px] font-medium text-[#1C1C1E] dark:text-white"
            numberOfLines={1}
          >
            {bill.biller_name}
          </Text>
          {isPaid ? (
            <View className="flex-row items-center gap-1 mt-0.5">
              <Ionicons name="checkmark-circle" size={13} color="#16A34A" />
              <Text className="text-[13px] text-green-600 font-medium">
                Paid
              </Text>
            </View>
          ) : (
            <Text className="text-[13px] text-[#8E8E93] mt-0.5">
              Due{" "}
              {new Date(bill.due_date).toLocaleDateString("en-PH", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </Text>
          )}
        </View>

        <Text className="text-[17px] font-semibold text-[#1C1C1E] dark:text-white ml-3">
          ₱{bill.amount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
        </Text>
      </TouchableOpacity>

      {showDivider && (
        <View className="bg-white dark:bg-[#1C1C1E]">
          <View className="ml-17 h-[0.5px] bg-[#C6C6C8] dark:bg-[#3A3A3C]" />
        </View>
      )}
    </View>
  );
}
