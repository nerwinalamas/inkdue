import BillForm, {
  BillFormValues,
  getDefaultBillValues,
} from "@/components/bill-form";
import Header from "@/components/header";
import { useBills } from "@/hooks/use-bills";
import { updateBill } from "@/lib/database";
import { scheduleBillReminders } from "@/lib/notifications";
import { extractBillInfo } from "@/lib/ocr";
import { toISODate } from "@/lib/toISODate";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AddBillScreen() {
  const router = useRouter();
  const { imageUri: passedImageUri } = useLocalSearchParams<{
    imageUri?: string;
  }>();

  const { addBill } = useBills();
  const [values, setValues] = useState<BillFormValues>(getDefaultBillValues);
  const [imageUri, setImageUri] = useState<string | null>(null);

  const processImage = useCallback(async (uri: string) => {
    setImageUri(uri);
    try {
      const result = await extractBillInfo(uri);
      setValues((prev) => ({
        ...prev,
        ...(result.billerName ? { billerName: result.billerName } : {}),
        ...(result.amount ? { amount: result.amount.toString() } : {}),
        ...(result.dueDate ? { dueDate: new Date(result.dueDate) } : {}),
      }));

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
    if (passedImageUri) processImage(passedImageUri);
  }, [passedImageUri, processImage]);

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

    // Save to DB
    const newId = addBill({
      biller_name: values.billerName.trim(),
      amount: parsedAmount,
      due_date: dueDateISO,
      status: "unpaid",
      category: values.category,
      image_uri: imageUri,
      notes: values.notes.trim() || null,
      notification_id: null,
    });

    // Schedule notifications and save IDs back to DB
    try {
      const notifIds = await scheduleBillReminders(
        newId,
        values.billerName.trim(),
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
      `Nai-save na ang bill para sa ${values.billerName.trim()}.`,
      [
        {
          text: "OK",
          onPress: () => {
            setValues(getDefaultBillValues());
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

        <BillForm values={values} onChange={setValues} />

        <TouchableOpacity
          className="mx-5 mt-6 bg-[#0A84FF] rounded-2xl py-4 items-center"
          activeOpacity={0.8}
          onPress={handleSave}
        >
          <Text className="text-white font-semibold text-[17px]">
            Save Bill
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
