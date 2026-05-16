import { Ionicons } from "@expo/vector-icons";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type SettingItem = {
  label: string;
  icon: string;
  value?: string;
  onPress?: () => void;
};

const SETTING_GROUPS: { title: string; items: SettingItem[] }[] = [
  {
    title: "Notifications",
    items: [
      {
        label: "Reminder timing",
        icon: "notifications-outline",
        value: "3 days, 1 day, day-of",
      },
      {
        label: "Notification sound",
        icon: "volume-medium-outline",
        value: "Default",
      },
    ],
  },
  {
    title: "Display",
    items: [
      { label: "Currency", icon: "cash-outline", value: "PHP (₱)" },
      { label: "Date format", icon: "calendar-outline", value: "MM/DD/YYYY" },
    ],
  },
  {
    title: "Data",
    items: [
      { label: "Export to CSV", icon: "download-outline" },
      { label: "Clear all data", icon: "trash-outline" },
    ],
  },
  {
    title: "About",
    items: [
      { label: "Version", icon: "information-circle-outline", value: "1.0.0" },
    ],
  },
];

export default function SettingsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Header */}
        <View className="px-5 pt-6 pb-4">
          <Text className="text-2xl font-bold text-gray-900">Settings</Text>
        </View>

        <View className="px-5 gap-6">
          {SETTING_GROUPS.map((group) => (
            <View key={group.title}>
              <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                {group.title}
              </Text>
              <View
                className="bg-white rounded-2xl overflow-hidden"
                style={{ elevation: 1 }}
              >
                {group.items.map((item, idx) => (
                  <TouchableOpacity
                    key={item.label}
                    className={`flex-row items-center px-4 py-3.5 ${
                      idx < group.items.length - 1
                        ? "border-b border-gray-100"
                        : ""
                    }`}
                    activeOpacity={0.6}
                    onPress={item.onPress}
                  >
                    <View className="w-8 h-8 rounded-lg bg-indigo-50 items-center justify-center mr-3">
                      <Ionicons
                        name={item.icon as any}
                        size={18}
                        color="#4F46E5"
                      />
                    </View>
                    <Text className="flex-1 text-gray-800 text-sm font-medium">
                      {item.label}
                    </Text>
                    {item.value ? (
                      <Text className="text-gray-400 text-sm mr-1">
                        {item.value}
                      </Text>
                    ) : null}
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color="#D1D5DB"
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
