import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  Animated,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Action = {
  icon: string;
  label: string;
  onPress: () => void;
};

export default function FloatingActionButton() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const animation = useRef(new Animated.Value(0)).current;

  function toggle() {
    const toValue = open ? 0 : 1;
    Animated.spring(animation, {
      toValue,
      useNativeDriver: true,
      friction: 6,
      tension: 80,
    }).start();
    setOpen(!open);
  }

  function handleAction(fn: () => void) {
    toggle();
    setTimeout(fn, 150);
  }

  // Order: index 0 = pinakamalapit sa main FAB (pinakababa)
  const actions: Action[] = [
    {
      icon: "create-outline",
      label: "Manual Entry",
      onPress: () =>
        router.push({ pathname: "/(tabs)/add", params: { mode: "manual" } }),
    },
    {
      icon: "image-outline",
      label: "Gallery",
      onPress: () =>
        router.push({ pathname: "/(tabs)/add", params: { mode: "gallery" } }),
    },
    {
      icon: "camera-outline",
      label: "Scan bill",
      onPress: () =>
        router.push({ pathname: "/(tabs)/add", params: { mode: "camera" } }),
    },
  ];

  const rotation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "45deg"],
  });

  return (
    <View
      style={{
        position: "absolute",
        bottom: 90,
        right: 20,
        alignItems: "flex-end",
        zIndex: 100,
      }}
      pointerEvents="box-none"
    >
      {/* Backdrop */}
      {open && (
        <Pressable
          style={{
            position: "absolute",
            top: -9999,
            left: -9999,
            right: -9999,
            bottom: -9999,
          }}
          onPress={toggle}
        />
      )}

      {/* Action buttons */}
      {actions.map((action, index) => {
        const translateY = animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -(index + 1) * 64],
        });

        const opacity = animation.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0, 0, 1],
        });

        const scale = animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0.5, 1],
        });

        return (
          <Animated.View
            key={action.label}
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              width: 48,
              height: 48,
              transform: [{ translateY }, { scale }],
              opacity,
            }}
            pointerEvents={open ? "auto" : "none"}
          >
            {/* Label */}
            <Text
              numberOfLines={1}
              style={{
                position: "absolute",
                right: 60,
                top: 14,
                fontSize: 13,
                fontWeight: "500",
                color: "#1F2937",
                minWidth: 80,
                textAlign: "right",
              }}
            >
              {action.label}
            </Text>

            {/* Mini FAB */}
            <TouchableOpacity
              onPress={() => handleAction(action.onPress)}
              activeOpacity={0.8}
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: "#4F46E5",
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#4F46E5",
                shadowOpacity: 0.35,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 4 },
                elevation: 6,
              }}
            >
              <Ionicons name={action.icon as any} size={20} color="white" />
            </TouchableOpacity>
          </Animated.View>
        );
      })}

      {/* Main FAB */}
      <TouchableOpacity
        onPress={toggle}
        activeOpacity={0.85}
        style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: "#4F46E5",
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#4F46E5",
          shadowOpacity: 0.4,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 4 },
          elevation: 8,
        }}
      >
        <Animated.View style={{ transform: [{ rotate: rotation }] }}>
          <Ionicons name="add" size={28} color="white" />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}
