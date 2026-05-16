import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Alert,
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
  const [billerName, setBillerName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [category, setCategory] = useState("electricity");
  const [notes, setNotes] = useState("");

  function handleSave() {
    if (!billerName.trim()) {
      Alert.alert("Required", "Lagyan mo ng pangalan ang biller.");
      return;
    }
    if (!amount || isNaN(Number(amount))) {
      Alert.alert("Required", "Maglagay ng valid na amount.");
      return;
    }
    if (!dueDate) {
      Alert.alert("Required", "Lagyan ng due date.");
      return;
    }

    Alert.alert("Saved!", `Nai-save na ang bill para sa ${billerName}.`, [
      {
        text: "OK",
        onPress: () => {
          setBillerName("");
          setAmount("");
          setDueDate("");
          setNotes("");
          setCategory("electricity");
        },
      },
    ]);
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
            Manual entry — OCR scanning coming soon!
          </Text>
        </View>

        {/* Scan placeholder */}
        <TouchableOpacity
          className="mx-5 mb-6 border-2 border-dashed border-indigo-300 rounded-2xl py-6 items-center bg-indigo-50"
          activeOpacity={0.7}
          onPress={() =>
            Alert.alert(
              "Coming soon",
              "OCR scanning will be available in the next update!",
            )
          }
        >
          <Ionicons name="camera-outline" size={32} color="#6366F1" />
          <Text className="text-indigo-600 font-semibold text-base mt-2">
            Scan a bill
          </Text>
          <Text className="text-indigo-400 text-xs mt-1">
            Camera or photo from gallery
          </Text>
        </TouchableOpacity>

        {/* Divider */}
        <View className="flex-row items-center mx-5 mb-6 gap-3">
          <View className="flex-1 h-px bg-gray-200" />
          <Text className="text-gray-400 text-xs">or enter manually</Text>
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

          {/* Due date */}
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-1.5">
              Due date
            </Text>
            <TextInput
              className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-base"
              placeholder="YYYY-MM-DD  (e.g. 2025-06-10)"
              placeholderTextColor="#9CA3AF"
              value={dueDate}
              onChangeText={setDueDate}
              keyboardType="numbers-and-punctuation"
            />
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
                      className={`text-sm font-medium ${
                        selected ? "text-white" : "text-gray-600"
                      }`}
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
