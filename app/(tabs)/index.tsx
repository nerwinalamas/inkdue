import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const MOCK_BILLS = [
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
];

const CATEGORY_ICONS: Record<string, any> = {
  electricity: "flash-outline",
  water: "water-outline",
  internet: "wifi-outline",
  mobile: "phone-portrait-outline",
  other: "receipt-outline",
};

function getDaysUntilDue(dueDate: string) {
  const due = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function getDueLabel(days: number) {
  if (days < 0) return `Overdue ${Math.abs(days)}d`;
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  return `Due in ${days}d`;
}

function getDueBadgeClasses(days: number) {
  if (days < 0) return { bg: "bg-red-100", text: "text-red-600" };
  if (days <= 3) return { bg: "bg-orange-100", text: "text-orange-600" };
  return { bg: "bg-green-100", text: "text-green-600" };
}

export default function DashboardScreen() {
  const router = useRouter();
  const unpaidBills = MOCK_BILLS.filter((b) => b.status === "unpaid");
  const totalOwed = unpaidBills.reduce((sum, b) => sum + b.amount, 0);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Header */}
        <View className="px-5 pt-6 pb-4">
          <Text className="text-2xl font-bold text-gray-900">Inkdue</Text>
          <Text className="text-sm text-gray-500 mt-1">
            Track your bills, never miss a due date.
          </Text>
        </View>

        {/* Summary card */}
        <View className="mx-5 rounded-2xl bg-indigo-600 p-5 mb-6">
          <Text className="text-indigo-200 text-sm mb-1">Total unpaid</Text>
          <Text className="text-white text-3xl font-bold">
            ₱{totalOwed.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
          </Text>
          <Text className="text-indigo-200 text-sm mt-2">
            {unpaidBills.length} bill{unpaidBills.length !== 1 ? "s" : ""}{" "}
            pending
          </Text>
        </View>

        {/* Section header */}
        <View className="px-5 flex-row items-center justify-between mb-3">
          <Text className="text-base font-semibold text-gray-800">
            Upcoming bills
          </Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/history")}>
            <Text className="text-sm text-indigo-600">See all</Text>
          </TouchableOpacity>
        </View>

        {/* Bill list */}
        <View className="px-5 gap-3">
          {unpaidBills.length === 0 ? (
            <View className="items-center py-12">
              <Ionicons
                name="checkmark-circle-outline"
                size={48}
                color="#6B7280"
              />
              <Text className="text-gray-500 mt-3 text-base">
                All bills paid!
              </Text>
            </View>
          ) : (
            unpaidBills.map((bill) => {
              const days = getDaysUntilDue(bill.dueDate);
              const badge = getDueBadgeClasses(days);
              const icon =
                CATEGORY_ICONS[bill.category] ?? CATEGORY_ICONS.other;

              return (
                <TouchableOpacity
                  key={bill.id}
                  className="bg-white rounded-2xl p-4 flex-row items-center"
                  activeOpacity={0.7}
                  style={{ elevation: 1 }}
                >
                  <View className="w-11 h-11 rounded-xl bg-indigo-50 items-center justify-center mr-3">
                    <Ionicons name={icon} size={22} color="#4F46E5" />
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
                    <Text className="text-gray-900 font-bold text-base">
                      ₱
                      {bill.amount.toLocaleString("en-PH", {
                        minimumFractionDigits: 2,
                      })}
                    </Text>
                    <View className={`rounded-full px-2 py-0.5 ${badge.bg}`}>
                      <Text className={`text-xs font-medium ${badge.text}`}>
                        {getDueLabel(days)}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* Add button */}
        <TouchableOpacity
          className="mx-5 mt-6 bg-indigo-600 rounded-2xl py-4 flex-row items-center justify-center gap-2"
          activeOpacity={0.8}
          onPress={() => router.push("/(tabs)/add")}
        >
          <Ionicons name="add" size={20} color="white" />
          <Text className="text-white font-semibold text-base">Add a bill</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
