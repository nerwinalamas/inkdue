import FloatingActionButton from "@/components/floating-action-button";
import { HapticTab } from "@/components/haptic-tab";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { Tabs, usePathname } from "expo-router";
import { View } from "react-native";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const pathname = usePathname();
  const showFAB = pathname === "/";

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarStyle: {
            borderTopWidth: 0,
            elevation: 0,
            shadowOpacity: 0,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Dashboard",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="add"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: "History",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="time-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          // options={{
          //   title: "Settings",
          //   tabBarIcon: ({ color, size }) => (
          //     <Ionicons name="settings-outline" size={size} color={color} />
          //   ),
          // }}
          options={{
            href: null,
          }}
        />
      </Tabs>

      {showFAB && <FloatingActionButton />}
    </View>
  );
}
