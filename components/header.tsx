import { Text, View } from "react-native";

interface HeaderProps {
  title: string;
  subtitle: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  return (
    <View className="px-5 pt-6 pb-4">
      <Text className="text-2xl font-bold text-gray-900">{title}</Text>
      <Text className="text-sm text-gray-500 mt-1">{subtitle}</Text>
    </View>
  );
}
