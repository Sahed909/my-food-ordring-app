import { View, ActivityIndicator } from "react-native";
import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function RootIndex() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const mode = await AsyncStorage.getItem("app_mode");
        if (mode === "order") {
          router.replace("/scan");
        } else if (mode === "restaurant") {
          const restaurantId = await AsyncStorage.getItem("restaurant_id");
          router.replace(restaurantId ? "/(tabs)" : "/setup");
        } else {
          router.replace("/mode-select");
        }
      } catch (e) {
        router.replace("/mode-select");
      }
    })();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F9FAFB",
      }}
    >
      <ActivityIndicator size="large" color="#2563EB" />
    </View>
  );
}
