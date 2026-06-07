import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

type NavAction = {
  label: string;
  onPress: () => void;
  bold?: boolean;
};

type Props = {
  title: string;
  left?: NavAction;
  right?: NavAction;
};

export default function NavBar({ title, left, right }: Props) {
  return (
    <View className="flex-row items-center px-4 py-3">
      {/* Left */}
      {left ? (
        <TouchableOpacity
          onPress={left.onPress}
          activeOpacity={0.6}
          className="flex-row items-center"
        >
          <Ionicons name="chevron-back" size={20} color="#0A84FF" />
          <Text className="text-[17px] text-[#0A84FF] ml-0.5">
            {left.label}
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={{ width: 64 }} />
      )}

      {/* Title */}
      <Text className="flex-1 text-center text-[17px] font-semibold text-[#1C1C1E] dark:text-white">
        {title}
      </Text>

      {/* Right */}
      {right ? (
        <TouchableOpacity onPress={right.onPress} activeOpacity={0.6}>
          <Text
            className={`text-[17px] text-[#0A84FF] ${right.bold ? "font-semibold" : ""}`}
          >
            {right.label}
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={{ width: 64 }} />
      )}
    </View>
  );
}
