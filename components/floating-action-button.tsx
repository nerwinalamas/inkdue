import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
  Alert,
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
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  // Reset FAB when tab regains focus
  useFocusEffect(
    useCallback(() => {
      setOpen(false);
      animation.setValue(0);
      backdropOpacity.setValue(0);
    }, [animation, backdropOpacity]),
  );

  function toggle() {
    const toValue = open ? 0 : 1;
    Animated.parallel([
      Animated.spring(animation, {
        toValue,
        useNativeDriver: true,
        damping: 18,
        stiffness: 200,
        mass: 0.8,
      }),
      Animated.timing(backdropOpacity, {
        toValue,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
    setOpen(!open);
  }

  function handleAction(fn: () => void) {
    toggle();
    setTimeout(fn, 180);
  }

  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Kailangan ng camera permission.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: "images",
      quality: 0.8,
      allowsEditing: true,
    });
    if (!result.canceled && result.assets?.[0]) {
      router.push({
        pathname: "/(tabs)/add",
        params: { mode: "camera", imageUri: result.assets[0].uri },
      });
    }
  };

  const openGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Kailangan ng gallery permission.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      quality: 0.8,
      allowsEditing: true,
    });
    if (!result.canceled && result.assets?.[0]) {
      router.push({
        pathname: "/(tabs)/add",
        params: { mode: "gallery", imageUri: result.assets[0].uri },
      });
    }
  };

  const actions: Action[] = [
    {
      icon: "create-outline",
      label: "Manual Entry",
      onPress: () =>
        router.push({ pathname: "/(tabs)/add", params: { mode: "manual" } }),
    },
    {
      icon: "images-outline",
      label: "Choose Photo",
      onPress: openGallery,
    },
    {
      icon: "scan-outline",
      label: "Scan Bill",
      onPress: openCamera,
    },
  ];

  const rotation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "45deg"],
  });

  const mainScale = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.93],
  });

  return (
    <>
      {/* Backdrop */}
      <Animated.View
        className="absolute inset-0 z-90 bg-black/30"
        style={{ opacity: backdropOpacity }}
        pointerEvents={open ? "auto" : "none"}
      >
        <Pressable className="flex-1" onPress={toggle} />
      </Animated.View>

      <View
        className="absolute bottom-32 right-8 items-end z-100"
        pointerEvents="box-none"
      >
        {/* Action buttons */}
        {actions.map((action, index) => {
          const translateY = animation.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -(index + 1) * 68],
          });

          const opacity = animation.interpolate({
            inputRange: [0, 0.3 + index * 0.08, 1],
            outputRange: [0, 0, 1],
          });

          const scale = animation.interpolate({
            inputRange: [0, 1],
            outputRange: [0.6, 1],
          });

          return (
            <Animated.View
              key={action.label}
              className="absolute bottom-0 right-0"
              style={{
                transform: [{ translateY }, { scale }],
                opacity,
              }}
              pointerEvents={open ? "auto" : "none"}
            >
              {/* Label */}
              <View className="absolute right-16 top-0 bottom-0 justify-center items-center pr-3">
                <Text className="text-[13px] min-w-27.5 text-right font-medium text-gray-800 tracking-tight">
                  {action.label}
                </Text>
              </View>

              {/* Mini button */}
              <TouchableOpacity
                onPress={() => handleAction(action.onPress)}
                activeOpacity={0.75}
                className="w-14 h-14 rounded-full bg-[#0A84FF] items-center justify-center shadow-lg shadow-[#0A84FF]/40"
              >
                <Ionicons name={action.icon as any} size={22} color="white" />
              </TouchableOpacity>
            </Animated.View>
          );
        })}

        {/* Main FAB */}
        <Animated.View style={{ transform: [{ scale: mainScale }] }}>
          <TouchableOpacity
            onPress={toggle}
            activeOpacity={0.85}
            className="w-16 h-16 rounded-full bg-[#0A84FF] items-center justify-center shadow-xl shadow-[#0A84FF]/50"
          >
            <Animated.View style={{ transform: [{ rotate: rotation }] }}>
              <Ionicons name="add" size={32} color="white" />
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </>
  );
}
