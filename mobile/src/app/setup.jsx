import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { ArrowLeft } from "lucide-react-native";
import KeyboardAvoidingAnimatedView from "@/components/KeyboardAvoidingAnimatedView";
import { authFetch } from "@/utils/authFetch";

export default function SetupScreen() {
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleSetup = async () => {
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      const res = await authFetch("/api/restaurants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("Failed to create restaurant");
      const data = await res.json();
      if (data.id) {
        await AsyncStorage.setItem("restaurant_id", data.id.toString());
        router.replace("/(tabs)");
      }
    } catch (e) {
      Alert.alert("Error", "Could not set up restaurant. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const goBack = async () => {
    await AsyncStorage.removeItem("app_mode");
    router.replace("/mode-select");
  };

  return (
    <KeyboardAvoidingAnimatedView style={{ flex: 1 }} behavior="padding">
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

        {/* Back */}
        <TouchableOpacity
          onPress={goBack}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            marginTop: 8,
            marginBottom: 32,
          }}
        >
          <ArrowLeft size={18} color="#6B7280" />
          <Text style={{ color: "#6B7280", fontSize: 14 }}>Back</Text>
        </TouchableOpacity>

        <Text
          style={{
            fontSize: 26,
            fontWeight: "800",
            color: "#111827",
            marginBottom: 8,
          }}
        >
          Set up your restaurant
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: "#6B7280",
            marginBottom: 32,
            lineHeight: 21,
          }}
        >
          Enter your restaurant name to get started. You can always change this
          later.
        </Text>

        <Text
          style={{
            fontSize: 13,
            fontWeight: "600",
            color: "#374151",
            marginBottom: 6,
          }}
        >
          Restaurant Name
        </Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="e.g. The Spice Garden"
          placeholderTextColor="#9CA3AF"
          style={{
            borderWidth: 1.5,
            borderColor: "#E5E7EB",
            borderRadius: 12,
            padding: 14,
            fontSize: 15,
            color: "#111827",
            backgroundColor: "#FFFFFF",
            marginBottom: 24,
          }}
        />

        <TouchableOpacity
          onPress={handleSetup}
          disabled={submitting || !name.trim()}
          style={{
            backgroundColor: submitting || !name.trim() ? "#93C5FD" : "#2563EB",
            borderRadius: 14,
            padding: 16,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 16 }}>
            {submitting ? "Setting up..." : "Get Started"}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingAnimatedView>
  );
}
