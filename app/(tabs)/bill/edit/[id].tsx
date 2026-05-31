import { CATEGORIES } from "@/lib/constant";
import { getBillById, updateBill } from "@/lib/database";
import { formatDate } from "@/lib/formatDate";
import { scheduleBillReminders } from "@/lib/notifications";
import { toISODate } from "@/lib/toISODate";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditBillScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [billerName, setBillerName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [category, setCategory] = useState("electricity");
  const [notes, setNotes] = useState("");
  const [loaded, setLoaded] = useState(false);

  // Load existing bill data whenever screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (!id) return;
      const bill = getBillById(Number(id));
      if (!bill) {
        Alert.alert("Error", "Bill not found.");
        router.back();
        return;
      }
      setBillerName(bill.biller_name);
      setAmount(bill.amount.toString());
      setDueDate(new Date(bill.due_date));
      setCategory(bill.category);
      setNotes(bill.notes ?? "");
      setLoaded(true);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]),
  );

  async function handleSave() {
    if (!billerName.trim()) {
      Alert.alert("Required", "Lagyan mo ng pangalan ang biller.");
      return;
    }
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      Alert.alert("Required", "Maglagay ng valid na amount.");
      return;
    }

    const parsedAmount = parseFloat(amount);
    const dueDateISO = toISODate(dueDate);

    // Reschedule notifications for updated due date / name
    let notificationId: string | null = null;
    try {
      const notifIds = await scheduleBillReminders(
        Number(id),
        billerName.trim(),
        parsedAmount,
        dueDateISO,
      );
      if (notifIds.length > 0) notificationId = notifIds.join(",");
    } catch (e) {
      console.warn("Could not reschedule notifications:", e);
    }

    updateBill(Number(id), {
      biller_name: billerName.trim(),
      amount: parsedAmount,
      due_date: dueDateISO,
      category,
      notes: notes.trim() || null,
      ...(notificationId ? { notification_id: notificationId } : {}),
    });

    Alert.alert(
      "Saved!",
      `Na-update na ang bill para sa ${billerName.trim()}.`,
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
          {/* Right-side Save shortcut */}
          <TouchableOpacity onPress={handleSave} activeOpacity={0.6}>
            <Text className="text-[17px] text-[#0A84FF] font-semibold">
              Save
            </Text>
          </TouchableOpacity>
        </View>

        <View className="px-5 gap-6">
          {/* Bill Details card */}
          <View>
            <Text className="text-[13px] font-semibold text-[#8E8E93] uppercase tracking-widest mb-2 ml-1">
              Bill Details
            </Text>
            <View className="bg-white rounded-2xl overflow-hidden">
              {/* Biller Name */}
              <View className="px-4 py-3 flex-row items-center">
                <View className="w-8 h-8 rounded-lg bg-gray-100 items-center justify-center mr-3">
                  <Ionicons
                    name="storefront-outline"
                    size={16}
                    color="#6C6C70"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-[11px] text-[#8E8E93] font-medium mb-0.5">
                    Biller Name
                  </Text>
                  <TextInput
                    placeholder="e.g. Meralco, PLDT, Manila Water"
                    placeholderTextColor="#C7C7CC"
                    value={billerName}
                    onChangeText={setBillerName}
                    className="text-[17px] text-[#1C1C1E] p-0"
                  />
                </View>
              </View>

              <View className="ml-15 h-[0.5px] bg-[#C6C6C8]" />

              {/* Amount */}
              <View className="px-4 py-3 flex-row items-center">
                <View className="w-8 h-8 rounded-lg bg-gray-100 items-center justify-center mr-3">
                  <Ionicons name="cash-outline" size={16} color="#6C6C70" />
                </View>
                <View className="flex-1">
                  <Text className="text-[11px] text-[#8E8E93] font-medium mb-0.5">
                    Amount (₱)
                  </Text>
                  <TextInput
                    placeholder="0.00"
                    placeholderTextColor="#C7C7CC"
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="decimal-pad"
                    className="text-[17px] text-[#1C1C1E] p-0"
                  />
                </View>
              </View>

              <View className="ml-15 h-[0.5px] bg-[#C6C6C8]" />

              {/* Due Date */}
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.6}
                className="px-4 py-3 flex-row items-center"
              >
                <View className="w-8 h-8 rounded-lg bg-gray-100 items-center justify-center mr-3">
                  <Ionicons name="calendar-outline" size={16} color="#6C6C70" />
                </View>
                <View className="flex-1">
                  <Text className="text-[11px] text-[#8E8E93] font-medium mb-0.5">
                    Due Date
                  </Text>
                  <Text className="text-[17px] text-[#1C1C1E]">
                    {formatDate(dueDate)}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
              </TouchableOpacity>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={dueDate}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(_, selectedDate) => {
                  if (selectedDate) setDueDate(selectedDate);
                  if (Platform.OS === "android") setShowDatePicker(false);
                }}
              />
            )}
          </View>

          {/* Category */}
          <View>
            <Text className="text-[13px] font-semibold text-[#8E8E93] uppercase tracking-widest mb-2 ml-1">
              Category
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8, paddingBottom: 2 }}
            >
              {CATEGORIES.map((cat) => {
                const selected = category === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => setCategory(cat.id)}
                    activeOpacity={0.7}
                    className={`flex-row items-center gap-2 px-4 py-2.5 rounded-2xl ${
                      selected
                        ? "bg-gray-100 border border-gray-300"
                        : "bg-white"
                    }`}
                  >
                    <Ionicons
                      name={cat.icon as any}
                      size={15}
                      color="#6C6C70"
                    />
                    <Text className="text-sm font-medium">{cat.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Notes */}
          <View>
            <Text className="text-[13px] font-semibold text-[#8E8E93] uppercase tracking-widest mb-2 ml-1">
              Notes{" "}
              <Text className="text-[#C7C7CC] normal-case tracking-normal font-normal">
                — optional
              </Text>
            </Text>
            <View className="bg-white rounded-2xl px-4 py-3">
              <TextInput
                placeholder="Account number, reference, reminders…"
                placeholderTextColor="#C7C7CC"
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                className="text-[17px] text-[#1C1C1E]"
                style={{ minHeight: 72 }}
              />
            </View>
          </View>

          {/* Save button */}
          <TouchableOpacity
            className="bg-[#0A84FF] rounded-2xl py-4 items-center"
            activeOpacity={0.8}
            onPress={handleSave}
          >
            <Text className="text-white font-semibold text-[17px]">
              Save Changes
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
