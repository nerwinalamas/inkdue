import Header from "@/components/header";
import { useBills } from "@/hooks/use-bills";
import { CATEGORIES } from "@/lib/constant";
import { updateBill } from "@/lib/database";
import { formatDate } from "@/lib/formatDate";
import { scheduleBillReminders } from "@/lib/notifications";
import { extractBillInfo } from "@/lib/ocr";
import { toISODate } from "@/lib/toISODate";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
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

export default function AddBillScreen() {
  const router = useRouter();
  const { imageUri: passedImageUri } = useLocalSearchParams<{
    imageUri?: string;
  }>();

  const { addBill } = useBills();

  const [billerName, setBillerName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [category, setCategory] = useState("electricity");
  const [notes, setNotes] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);

  const processImage = useCallback(async (uri: string) => {
    setImageUri(uri);
    try {
      const result = await extractBillInfo(uri);
      if (result.billerName) setBillerName(result.billerName);
      if (result.amount) setAmount(result.amount.toString());
      if (result.dueDate) setDueDate(new Date(result.dueDate));

      const debugMsg =
        "Amount: " + result.amount + " ||| " + result.rawText.slice(0, 400);
      Alert.alert("DEBUG: Raw OCR", debugMsg);
      console.log("result:", result);
    } catch {
      Alert.alert(
        "Error",
        "Hindi na-scan ang bill. Subukan ulit o manual na i-type.",
      );
    }
  }, []);

  useEffect(() => {
    if (passedImageUri) {
      processImage(passedImageUri);
    }
  }, [passedImageUri, processImage]);

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

    // Save to DB
    const newId = addBill({
      biller_name: billerName.trim(),
      amount: parsedAmount,
      due_date: dueDateISO,
      status: "unpaid",
      category,
      image_uri: imageUri,
      notes: notes.trim() || null,
      notification_id: null,
    });

    // Schedule notifications and save IDs back to DB
    try {
      const notifIds = await scheduleBillReminders(
        newId,
        billerName.trim(),
        parsedAmount,
        dueDateISO,
      );
      if (notifIds.length > 0) {
        updateBill(newId, { notification_id: notifIds.join(",") });
      }
    } catch (e) {
      // Notifications are optional — don't block save
      console.warn("Could not schedule notifications:", e);
    }

    Alert.alert(
      "Saved!",
      `Nai-save na ang bill para sa ${billerName.trim()}.`,
      [
        {
          text: "OK",
          onPress: () => {
            setBillerName("");
            setAmount("");
            setDueDate(new Date());
            setNotes("");
            setCategory("electricity");
            setImageUri(null);
            router.push("/(tabs)");
          },
        },
      ],
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F2F2F7]">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 48 }}
        keyboardShouldPersistTaps="handled"
      >
        <Header
          title="Add Bill"
          subtitle="Fill in the details or scan another bill."
        />

        <View className="px-5 gap-6">
          {/* Biller Name + Amount — grouped iOS card */}
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

              {/* Divider */}
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

              {/* Divider */}
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
                minimumDate={new Date()}
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
              Save Bill
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
