import { CATEGORIES } from "@/lib/constant";
import { formatDate } from "@/lib/formatDate";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import {
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export function getDefaultBillValues(): BillFormValues {
  return {
    billerName: "",
    amount: "",
    dueDate: new Date(),
    category: "electricity",
    notes: "",
  };
}

export type BillFormValues = {
  billerName: string;
  amount: string;
  dueDate: Date;
  category: string;
  notes: string;
};

type Props = {
  values: BillFormValues;
  onChange: (values: BillFormValues) => void;
};

export default function BillForm({ values, onChange }: Props) {
  const [showDatePicker, setShowDatePicker] = useState(false);

  function set(patch: Partial<BillFormValues>) {
    onChange({ ...values, ...patch });
  }

  return (
    <View className="px-5 gap-6">
      {/* Bill Details card */}
      <View>
        <Text className="text-[13px] font-semibold text-[#8E8E93] uppercase tracking-widest mb-2 ml-1">
          Bill Details
        </Text>
        <View className="bg-white dark:bg-[#1C1C1E] rounded-2xl overflow-hidden">
          {/* Biller Name */}
          <View className="px-4 py-3 flex-row items-center">
            <View className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-[#2C2C2E] items-center justify-center mr-3">
              <Ionicons name="storefront-outline" size={16} color="#6C6C70" />
            </View>
            <View className="flex-1">
              <Text className="text-[11px] text-[#8E8E93] font-medium mb-0.5">
                Biller Name
              </Text>
              <TextInput
                placeholder="e.g. Meralco, PLDT, Manila Water"
                placeholderTextColor="#C7C7CC"
                value={values.billerName}
                onChangeText={(v) => set({ billerName: v })}
                className="text-[17px] text-[#1C1C1E] dark:text-white p-0"
              />
            </View>
          </View>

          <View className="ml-15 h-[0.5px] bg-[#C6C6C8] dark:bg-[#3A3A3C]" />

          {/* Amount */}
          <View className="px-4 py-3 flex-row items-center">
            <View className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-[#2C2C2E] items-center justify-center mr-3">
              <Ionicons name="cash-outline" size={16} color="#6C6C70" />
            </View>
            <View className="flex-1">
              <Text className="text-[11px] text-[#8E8E93] font-medium mb-0.5">
                Amount (₱)
              </Text>
              <TextInput
                placeholder="0.00"
                placeholderTextColor="#C7C7CC"
                value={values.amount}
                onChangeText={(v) => set({ amount: v })}
                keyboardType="decimal-pad"
                className="text-[17px] text-[#1C1C1E] dark:text-white p-0"
              />
            </View>
          </View>

          <View className="ml-15 h-[0.5px] bg-[#C6C6C8] dark:bg-[#3A3A3C]" />

          {/* Due Date */}
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.6}
            className="px-4 py-3 flex-row items-center"
          >
            <View className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-[#2C2C2E] items-center justify-center mr-3">
              <Ionicons name="calendar-outline" size={16} color="#6C6C70" />
            </View>
            <View className="flex-1">
              <Text className="text-[11px] text-[#8E8E93] font-medium mb-0.5">
                Due Date
              </Text>
              <Text className="text-[17px] text-[#1C1C1E] dark:text-white">
                {formatDate(values.dueDate)}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={values.dueDate}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(_, selectedDate) => {
              if (selectedDate) set({ dueDate: selectedDate });
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
            const selected = values.category === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                onPress={() => set({ category: cat.id })}
                activeOpacity={0.7}
                className={`flex-row items-center gap-2 px-4 py-2.5 rounded-2xl ${
                  selected
                    ? "bg-gray-100 dark:bg-[#2C2C2E] border border-gray-300 dark:border-[#3A3A3C]"
                    : "bg-white dark:bg-[#1C1C1E]"
                }`}
              >
                <Ionicons name={cat.icon as any} size={15} color="#6C6C70" />
                <Text className="text-sm font-medium text-[#1C1C1E] dark:text-white">
                  {cat.label}
                </Text>
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
        <View className="bg-white dark:bg-[#1C1C1E] rounded-2xl px-4 py-3">
          <TextInput
            placeholder="Account number, reference, reminders…"
            placeholderTextColor="#C7C7CC"
            value={values.notes}
            onChangeText={(v) => set({ notes: v })}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            className="text-[17px] text-[#1C1C1E] dark:text-white"
            style={{ minHeight: 72 }}
          />
        </View>
      </View>
    </View>
  );
}
