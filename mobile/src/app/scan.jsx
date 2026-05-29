import { View, Text, TouchableOpacity } from "react-native";
import { useState } from "react";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ArrowLeftRight } from "lucide-react-native";

export default function ScanScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  const handleBarCodeScanned = ({ data }) => {
    if (scanned) return;
    setScanned(true);

    if (data && data.includes("/order/")) {
      router.push({ pathname: "/order-view", params: { url: data } });
      setTimeout(() => setScanned(false), 2000);
    } else {
      alert(
        "This QR code is not a valid QRMenu order code. Please scan a QRMenu code.",
      );
      setScanned(false);
    }
  };

  const switchMode = async () => {
    await AsyncStorage.removeItem("app_mode");
    router.replace("/mode-select");
  };

  if (!permission) {
    return <View style={{ flex: 1, backgroundColor: "#000" }} />;
  }

  if (!permission.granted) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#111827",
          justifyContent: "center",
          alignItems: "center",
          padding: 32,
          paddingTop: insets.top,
        }}
      >
        <StatusBar style="light" />
        <Text
          style={{
            fontSize: 22,
            fontWeight: "700",
            color: "#FFFFFF",
            marginBottom: 12,
            textAlign: "center",
          }}
        >
          Camera Access Needed
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: "#9CA3AF",
            textAlign: "center",
            marginBottom: 32,
          }}
        >
          We need your camera to scan QR codes at restaurants.
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          style={{
            backgroundColor: "#2563EB",
            borderRadius: 14,
            paddingVertical: 14,
            paddingHorizontal: 32,
            marginBottom: 16,
          }}
        >
          <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 16 }}>
            Allow Camera
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={switchMode}>
          <Text style={{ color: "#9CA3AF", fontSize: 14 }}>Switch mode</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <StatusBar style="light" />

      {/* Camera */}
      <CameraView
        style={{ flex: 1 }}
        onBarcodeScanned={handleBarCodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
      />

      {/* Overlay */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          justifyContent: "space-between",
        }}
      >
        {/* Top bar */}
        <View
          style={{
            paddingTop: insets.top + 16,
            paddingHorizontal: 20,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text style={{ color: "#FFFFFF", fontSize: 18, fontWeight: "700" }}>
            Scan to Order
          </Text>
          <TouchableOpacity
            onPress={switchMode}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              backgroundColor: "rgba(255,255,255,0.15)",
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 999,
            }}
          >
            <ArrowLeftRight size={14} color="#FFFFFF" />
            <Text style={{ color: "#FFFFFF", fontSize: 13, fontWeight: "600" }}>
              Switch Mode
            </Text>
          </TouchableOpacity>
        </View>

        {/* Scanner frame */}
        <View style={{ alignItems: "center", justifyContent: "center" }}>
          <View style={{ width: 240, height: 240, position: "relative" }}>
            {[
              { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3 },
              { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3 },
              { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3 },
              {
                bottom: 0,
                right: 0,
                borderBottomWidth: 3,
                borderRightWidth: 3,
              },
            ].map((style, i) => (
              <View
                key={i}
                style={{
                  position: "absolute",
                  width: 32,
                  height: 32,
                  borderColor: "#FFFFFF",
                  ...style,
                }}
              />
            ))}

            {scanned && (
              <View
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundColor: "rgba(34,197,94,0.3)",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 4,
                }}
              >
                <Text
                  style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 18 }}
                >
                  ✓ Scanned
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Bottom hint */}
        <View
          style={{
            paddingBottom: insets.bottom + 32,
            paddingHorizontal: 40,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: "rgba(255,255,255,0.75)",
              fontSize: 14,
              textAlign: "center",
            }}
          >
            Point your camera at the QR code on the restaurant's table or menu
          </Text>
        </View>
      </View>
    </View>
  );
}
