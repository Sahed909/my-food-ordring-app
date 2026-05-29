import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { WebView } from "react-native-webview";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { ArrowLeft, RotateCcw } from "lucide-react-native";
import { useState, useRef } from "react";

export default function OrderViewScreen() {
  const { url } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const webviewRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === "order_placed" && data.orderId) {
        router.replace({
          pathname: "/customer-orders",
          params: { orderId: String(data.orderId) },
        });
      }
    } catch (e) {
      // Not our message, ignore
    }
  };

  if (!url) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#F9FAFB",
        }}
      >
        <Text style={{ color: "#6B7280", marginBottom: 12 }}>
          No URL provided.
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            backgroundColor: "#2563EB",
            borderRadius: 10,
            paddingVertical: 10,
            paddingHorizontal: 24,
          }}
        >
          <Text style={{ color: "#FFFFFF", fontWeight: "600" }}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View
      style={{ flex: 1, backgroundColor: "#FFFFFF", paddingTop: insets.top }}
    >
      <StatusBar style="dark" />

      {/* Top bar */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingVertical: 10,
          borderBottomWidth: 1,
          borderColor: "#F3F4F6",
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            padding: 4,
          }}
        >
          <ArrowLeft size={18} color="#374151" />
          <Text style={{ color: "#374151", fontSize: 14, fontWeight: "500" }}>
            Back to Scanner
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            setError(false);
            setLoading(true);
            webviewRef.current?.reload();
          }}
          style={{ padding: 4 }}
        >
          <RotateCcw size={18} color="#374151" />
        </TouchableOpacity>
      </View>

      {/* Loading */}
      {loading && !error && (
        <View
          style={{
            position: "absolute",
            top: "50%",
            left: 0,
            right: 0,
            alignItems: "center",
            zIndex: 10,
          }}
        >
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={{ color: "#6B7280", marginTop: 8, fontSize: 13 }}>
            Loading menu...
          </Text>
        </View>
      )}

      {/* Error */}
      {error && (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 32,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: "700",
              color: "#111827",
              marginBottom: 8,
            }}
          >
            Couldn't load menu
          </Text>
          <Text
            style={{ color: "#6B7280", textAlign: "center", marginBottom: 24 }}
          >
            Make sure you're connected to the internet and the QR code is still
            valid.
          </Text>
          <TouchableOpacity
            onPress={() => {
              setError(false);
              setLoading(true);
              webviewRef.current?.reload();
            }}
            style={{
              backgroundColor: "#2563EB",
              borderRadius: 10,
              paddingVertical: 12,
              paddingHorizontal: 28,
            }}
          >
            <Text style={{ color: "#FFFFFF", fontWeight: "600" }}>
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* WebView */}
      <WebView
        ref={webviewRef}
        source={{ uri: url }}
        style={{ flex: 1, opacity: error ? 0 : 1 }}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
        onMessage={handleMessage}
      />
    </View>
  );
}
