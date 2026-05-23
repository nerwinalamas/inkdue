import Header from "@/components/header";
import { useBills } from "@/hooks/use-bills";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { ActivityIndicator, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DashboardScreen() {
  const { loading, refresh } = useBills();

  // Refresh data every time tab is focused
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#4F46E5" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <Header
          title="Inkdue"
          subtitle="Track your bills, never miss a due date."
        />
      </ScrollView>
    </SafeAreaView>
  );
}
