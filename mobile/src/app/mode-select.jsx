import { View, Text, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ShoppingBag, UtensilsCrossed } from "lucide-react-native";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { useAuth } from "@/utils/auth/useAuth";
import { getRestaurantId } from "@/utils/getRestaurantId";

export default function ModeSelectScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { auth, signIn } = useAuth();
  const [pendingRestaurant, setPendingRestaurant] = useState(false);

  // Once auth is ready and we have a pending restaurant navigation, proceed
  useEffect(() => {
    if (auth && pendingRestaurant) {
      setPendingRestaurant(false);
      proceedToRestaurant();
    }
  }, [auth, pendingRestaurant]);

  const proceedToRestaurant = async () => {
    await AsyncStorage.setItem("app_mode", "restaurant");
    // Checks AsyncStorage first, then fetches from server — works across devices
    const restaurantId = await getRestaurantId();
    if (restaurantId) {
      router.replace("/(tabs)");
    } else {
      router.replace("/setup");
    }
  };

  const selectMode = async (mode) => {
    if (mode === "order") {
      await AsyncStorage.setItem("app_mode", mode);
      router.replace("/scan");
    } else {
      // Restaurant owner mode requires authentication
      if (!auth) {
        setPendingRestaurant(true);
        signIn();
        return;
      }
      proceedToRestaurant();
    }
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#F9FAFB",
        paddingTop: insets.top,
        paddingBottom: insets.bottom + 24,
        paddingHorizontal: 20,
      }}
    >
      <StatusBar style="dark" />

      <View style={{ flex: 1, justifyContent: "center" }}>
        <Text
          style={{
            fontSize: 32,
            fontWeight: "800",
            color: "#111827",
            marginBottom: 8,
          }}
        >
          QRMenu
        </Text>
        <Text style={{ fontSize: 16, color: "#6B7280", marginBottom: 40 }}>
          How would you like to use the app today?
        </Text>

        {/* Order Mode */}
        <TouchableOpacity
          onPress={() => selectMode("order")}
          activeOpacity={0.85}
          style={{
            backgroundColor: "#2563EB",
            borderRadius: 20,
            padding: 24,
            flexDirection: "row",
            alignItems: "center",
            gap: 20,
            marginBottom: 16,
          }}
        >
          <View
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              backgroundColor: "rgba(255,255,255,0.2)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ShoppingBag size={24} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 17,
                fontWeight: "700",
                color: "#FFFFFF",
                marginBottom: 4,
              }}
            >
              I want to order
            </Text>
            <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.75)" }}>
              Scan a QR code at a restaurant and browse the menu
            </Text>
          </View>
        </TouchableOpacity>

        {/* Restaurant Mode */}
        <TouchableOpacity
          onPress={() => selectMode("restaurant")}
          activeOpacity={0.85}
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 20,
            padding: 24,
            flexDirection: "row",
            alignItems: "center",
            gap: 20,
            borderWidth: 1.5,
            borderColor: "#E5E7EB",
          }}
        >
          <View
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              backgroundColor: "#EFF6FF",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <UtensilsCrossed size={24} color="#2563EB" />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 17,
                fontWeight: "700",
                color: "#111827",
                marginBottom: 4,
              }}
            >
              Restaurant owner
            </Text>
            <Text style={{ fontSize: 13, color: "#6B7280" }}>
              Manage your menu, generate QR codes and view orders
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}
