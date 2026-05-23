import { useBills } from "@/hooks/use-bills";
import { updateBill } from "@/lib/database";
import { scheduleBillReminders } from "@/lib/notifications";
import { extractBillInfo } from "@/lib/ocr";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const CATEGORIES = [
  { id: "electricity", label: "Electricity", icon: "flash-outline" },
  { id: "water", label: "Water", icon: "water-outline" },
  { id: "internet", label: "Internet", icon: "wifi-outline" },
  { id: "mobile", label: "Mobile", icon: "phone-portrait-outline" },
  { id: "rent", label: "Rent", icon: "home-outline" },
  { id: "other", label: "Other", icon: "receipt-outline" },
];

export default function AddBillScreen() {
  const router = useRouter();
  const { addBill } = useBills();

  const [billerName, setBillerName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [category, setCategory] = useState("electricity");
  const [notes, setNotes] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);

  function formatDate(date: Date) {
    return date.toLocaleDateString("en-PH", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function toISODate(date: Date) {
    return date.toISOString().split("T")[0]; // "2025-06-10"
  }

  async function processImage(uri: string) {
    setImageUri(uri);
    setScanning(true);
    try {
      const result = await extractBillInfo(uri);

      // Pre-fill fields with OCR result
      if (result.billerName) setBillerName(result.billerName);
      if (result.amount) setAmount(result.amount.toString());
      if (result.dueDate) setDueDate(new Date(result.dueDate));

      // DEBUG — tanggalin ito pagkatapos ma-fix ang OCR
      const debugMsg =
        "Amount: " + result.amount + " ||| " + result.rawText.slice(0, 400);
      Alert.alert("DEBUG: Raw OCR", debugMsg);

      console.log("result:", result);
    } catch {
      Alert.alert(
        "Error",
        "Hindi na-scan ang bill. Subukan ulit o manual na i-type.",
      );
    } finally {
      setScanning(false);
    }
  }

  async function handleCamera() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Kailangan ng camera permission para mag-scan.",
      );
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: "images",
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      await processImage(result.assets[0].uri);
    }
  }

  async function handleGallery() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Kailangan ng gallery permission.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      await processImage(result.assets[0].uri);
    }
  }

  function handleScanPress() {
    Alert.alert("Scan a bill", "Piliin ang source ng larawan:", [
      { text: "Camera", onPress: handleCamera },
      { text: "Gallery", onPress: handleGallery },
      { text: "Cancel", style: "cancel" },
    ]);
  }

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
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 48 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View className="px-5 pt-6 pb-4">
          <Text className="text-2xl font-bold text-gray-900">Add Bill</Text>
          <Text className="text-sm text-gray-500 mt-1">
            Scan or enter your bill manually.
          </Text>
        </View>

        {/* Scan card */}
        {scanning ? (
          <View className="mx-5 mb-6 rounded-2xl bg-indigo-50 py-8 items-center gap-3">
            <ActivityIndicator size="large" color="#4F46E5" />
            <Text className="text-indigo-600 font-medium">
              Scanning bill...
            </Text>
          </View>
        ) : imageUri ? (
          // Show scanned image preview
          <View
            className="mx-5 mb-6 rounded-2xl overflow-hidden"
            style={{ elevation: 1 }}
          >
            <Image
              source={{ uri: imageUri }}
              style={{ width: "100%", height: 180 }}
              resizeMode="cover"
            />
            <TouchableOpacity
              className="bg-white flex-row items-center justify-center py-3 gap-2"
              onPress={handleScanPress}
              activeOpacity={0.7}
            >
              <Ionicons name="refresh-outline" size={18} color="#4F46E5" />
              <Text className="text-indigo-600 font-medium text-sm">
                Scan a different bill
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Scan placeholder
          <TouchableOpacity
            className="mx-5 mb-6 border-2 border-dashed border-indigo-300 rounded-2xl py-6 items-center bg-indigo-50"
            activeOpacity={0.7}
            onPress={handleScanPress}
          >
            <Ionicons name="camera-outline" size={32} color="#6366F1" />
            <Text className="text-indigo-600 font-semibold text-base mt-2">
              Scan a bill
            </Text>
            <Text className="text-indigo-400 text-xs mt-1">
              Camera or photo from gallery
            </Text>
          </TouchableOpacity>
        )}

        {/* Divider */}
        <View className="flex-row items-center mx-5 mb-6 gap-3">
          <View className="flex-1 h-px bg-gray-200" />
          <Text className="text-gray-400 text-xs">
            {imageUri ? "review & edit details" : "or enter manually"}
          </Text>
          <View className="flex-1 h-px bg-gray-200" />
        </View>

        {/* Form */}
        <View className="px-5 gap-4">
          {/* Biller name */}
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-1.5">
              Biller name
            </Text>
            <TextInput
              className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-base"
              placeholder="e.g. Meralco, PLDT, Manila Water"
              placeholderTextColor="#9CA3AF"
              value={billerName}
              onChangeText={setBillerName}
            />
          </View>

          {/* Amount */}
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-1.5">
              Amount (₱)
            </Text>
            <TextInput
              className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-base"
              placeholder="0.00"
              placeholderTextColor="#9CA3AF"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
            />
          </View>

          {/* Due date picker */}
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-1.5">
              Due date
            </Text>
            <TouchableOpacity
              className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex-row items-center justify-between"
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.7}
            >
              <Text className="text-gray-900 text-base">
                {formatDate(dueDate)}
              </Text>
              <Ionicons name="calendar-outline" size={20} color="#6B7280" />
            </TouchableOpacity>

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
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Category
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8, paddingBottom: 4 }}
            >
              {CATEGORIES.map((cat) => {
                const selected = category === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => setCategory(cat.id)}
                    className={`flex-row items-center gap-1.5 px-4 py-2.5 rounded-xl border ${
                      selected
                        ? "bg-indigo-600 border-indigo-600"
                        : "bg-white border-gray-200"
                    }`}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={cat.icon as any}
                      size={16}
                      color={selected ? "white" : "#6B7280"}
                    />
                    <Text
                      className={`text-sm font-medium ${selected ? "text-white" : "text-gray-600"}`}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Notes */}
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-1.5">
              Notes{" "}
              <Text className="text-gray-400 font-normal">(optional)</Text>
            </Text>
            <TextInput
              className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-base"
              placeholder="e.g. Account number, reference, etc."
              placeholderTextColor="#9CA3AF"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              style={{ minHeight: 80 }}
            />
          </View>

          {/* Save button */}
          <TouchableOpacity
            className="bg-indigo-600 rounded-2xl py-4 items-center mt-2"
            activeOpacity={0.8}
            onPress={handleSave}
          >
            <Text className="text-white font-semibold text-base">
              Save bill
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
