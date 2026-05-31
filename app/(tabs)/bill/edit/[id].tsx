import BillForm, {
  BillFormValues,
  getDefaultBillValues,
} from "@/components/bill-form";
import { getBillById, updateBill } from "@/lib/database";
import { scheduleBillReminders } from "@/lib/notifications";
import { toISODate } from "@/lib/toISODate";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditBillScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [values, setValues] = useState<BillFormValues>(getDefaultBillValues);
  const [loaded, setLoaded] = useState(false);

  // Load existing bill data whenever screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (!id) return;
      const bill = getBillById(Number(id));
      if (!bill) {
        Alert.alert("Error", "Bill not found.");
        router.push("/(tabs)/history");
        return;
      }
      setValues({
        billerName: bill.biller_name,
        amount: bill.amount.toString(),
        dueDate: new Date(bill.due_date),
        category: bill.category,
        notes: bill.notes ?? "",
      });
      setLoaded(true);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]),
  );

  async function handleSave() {
    if (!values.billerName.trim()) {
      Alert.alert("Required", "Lagyan mo ng pangalan ang biller.");
      return;
    }
    if (
      !values.amount ||
      isNaN(Number(values.amount)) ||
      Number(values.amount) <= 0
    ) {
      Alert.alert("Required", "Maglagay ng valid na amount.");
      return;
    }

    const parsedAmount = parseFloat(values.amount);
    const dueDateISO = toISODate(values.dueDate);

    let notificationId: string | null = null;
    try {
      const notifIds = await scheduleBillReminders(
        Number(id),
        values.billerName.trim(),
        parsedAmount,
        dueDateISO,
      );
      if (notifIds.length > 0) notificationId = notifIds.join(",");
    } catch (e) {
      console.warn("Could not reschedule notifications:", e);
    }

    updateBill(Number(id), {
      biller_name: values.billerName.trim(),
      amount: parsedAmount,
      due_date: dueDateISO,
      category: values.category,
      notes: values.notes.trim() || null,
      ...(notificationId ? { notification_id: notificationId } : {}),
    });

    Alert.alert(
      "Saved!",
      `Na-update na ang bill para sa ${values.billerName.trim()}.`,
      [
        {
          text: "OK",
          onPress: () => router.push(`/(tabs)/bill/${id}`),
        },
      ],
    );
  }

  if (!loaded) {
    return (
      <SafeAreaView className="flex-1 bg-[#F2F2F7] items-center justify-center">
        <Text className="text-[#8E8E93] text-[17px]">Loading…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F2F2F7]">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 48 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Nav bar */}
        <View className="flex-row items-center px-4 py-3">
          <TouchableOpacity
            onPress={() => router.push(`/(tabs)/bill/${id}`)}
            activeOpacity={0.6}
            className="flex-row items-center"
          >
            <Ionicons name="chevron-back" size={20} color="#0A84FF" />
            <Text className="text-[17px] text-[#0A84FF] ml-0.5">Back</Text>
          </TouchableOpacity>
          <Text className="flex-1 text-center text-[17px] font-semibold text-[#1C1C1E]">
            Edit Bill
          </Text>
          <TouchableOpacity onPress={handleSave} activeOpacity={0.6}>
            <Text className="text-[17px] text-[#0A84FF] font-semibold">
              Save
            </Text>
          </TouchableOpacity>
        </View>

        <BillForm values={values} onChange={setValues} />

        <TouchableOpacity
          className="mx-5 mt-6 bg-[#0A84FF] rounded-2xl py-4 items-center"
          activeOpacity={0.8}
          onPress={handleSave}
        >
          <Text className="text-white font-semibold text-[17px]">
            Save Changes
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
