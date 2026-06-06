import Header from "@/components/header";
import { Ionicons } from "@expo/vector-icons";
import { ScrollView, Switch, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type RowIcon = {
  name: string;
  bg: string;
  color: string;
};

function SectionLabel({ title }: { title: string }) {
  return (
    <Text className="text-[12px] font-semibold text-[#8E8E93] uppercase tracking-widest px-4 mb-2 ml-1">
      {title}
    </Text>
  );
}

function SettingsGroup({ children }: { children: React.ReactNode }) {
  return (
    <View className="mx-5 bg-white rounded-2xl overflow-hidden mb-4">
      {children}
    </View>
  );
}

function RowDivider() {
  return (
    <View className="bg-white">
      <View className="ml-14 h-[0.5px] bg-[#E5E5EA]" />
    </View>
  );
}

function ToggleRow({
  icon,
  label,
  value,
  onValueChange,
}: {
  icon: RowIcon;
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}) {
  return (
    <View className="flex-row items-center px-4 py-2 min-h-12.5 gap-3">
      <View
        className="w-7.5 h-7.5 rounded-lg items-center justify-center"
        style={{ backgroundColor: icon.bg }}
      >
        <Ionicons name={icon.name as any} size={16} color={icon.color} />
      </View>
      <Text className="flex-1 text-[16px] text-[#1C1C1E]">{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: "#E5E5EA", true: "#34C759" }}
        thumbColor="white"
        ios_backgroundColor="#E5E5EA"
      />
    </View>
  );
}

function ChevronRow({
  icon,
  label,
  value,
  onPress,
  destructive = false,
}: {
  icon: RowIcon;
  label: string;
  value?: string;
  onPress: () => void;
  destructive?: boolean;
}) {
  return (
    <TouchableOpacity
      className="flex-row items-center px-4 py-2 min-h-12.5 gap-3"
      activeOpacity={0.6}
      onPress={onPress}
    >
      <View
        className="w-7.5 h-7.5 rounded-lg items-center justify-center"
        style={{ backgroundColor: icon.bg }}
      >
        <Ionicons name={icon.name as any} size={16} color={icon.color} />
      </View>
      <Text
        className={`flex-1 text-[16px] ${destructive ? "text-[#FF3B30]" : "text-[#1C1C1E]"}`}
      >
        {label}
      </Text>
      {value && (
        <Text className="text-[15px] text-[#8E8E93] mr-1">{value}</Text>
      )}
      {!destructive && (
        <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
      )}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#F2F2F7]">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <Header title="Settings" />

        {/* Notifications */}
        <View className="my-1">
          <SectionLabel title="Notifications" />
          <SettingsGroup>
            <ToggleRow
              icon={{
                name: "notifications-outline",
                bg: "#0A84FF",
                color: "white",
              }}
              label="Bill reminders"
              value={true}
              onValueChange={() => {}}
            />
            <RowDivider />
            <ChevronRow
              icon={{ name: "time-outline", bg: "#FF9500", color: "white" }}
              label="Remind me before"
              value="3 days"
              onPress={() => {}}
            />
            <RowDivider />
            <ToggleRow
              icon={{
                name: "alert-circle-outline",
                bg: "#AF52DE",
                color: "white",
              }}
              label="Overdue alerts"
              value={true}
              onValueChange={() => {}}
            />
          </SettingsGroup>
        </View>

        {/* Appearance */}
        <View className="mb-1">
          <SectionLabel title="Appearance" />
          <SettingsGroup>
            <ToggleRow
              icon={{ name: "moon-outline", bg: "#8E8E93", color: "white" }}
              label="Dark mode"
              value={false}
              onValueChange={() => {}}
            />
            <RowDivider />
            <ChevronRow
              icon={{ name: "cash-outline", bg: "#32ADE6", color: "white" }}
              label="Currency"
              value="₱ PHP"
              onPress={() => {}}
            />
          </SettingsGroup>
        </View>

        {/* Data */}
        <View className="mb-1">
          <SectionLabel title="Data" />
          <SettingsGroup>
            <ChevronRow
              icon={{ name: "download-outline", bg: "#34C759", color: "white" }}
              label="Export bills"
              onPress={() => {}}
            />
            <RowDivider />
            <ChevronRow
              icon={{
                name: "cloud-upload-outline",
                bg: "#0A84FF",
                color: "white",
              }}
              label="Import bills"
              onPress={() => {}}
            />
          </SettingsGroup>
        </View>

        {/* About */}
        <View className="mb-1">
          <SectionLabel title="About" />
          <SettingsGroup>
            <ChevronRow
              icon={{
                name: "information-circle-outline",
                bg: "#8E8E93",
                color: "white",
              }}
              label="Version"
              value="1.0.0"
              onPress={() => {}}
            />
            <RowDivider />
            <ChevronRow
              icon={{
                name: "document-text-outline",
                bg: "#8E8E93",
                color: "white",
              }}
              label="Privacy policy"
              onPress={() => {}}
            />
          </SettingsGroup>
        </View>

        {/* Danger */}
        <View className="mb-1">
          <SettingsGroup>
            <ChevronRow
              icon={{ name: "trash-outline", bg: "#FF3B30", color: "white" }}
              label="Delete all bills"
              onPress={() => {}}
              destructive
            />
          </SettingsGroup>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
