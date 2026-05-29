import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useEffect, useState, useCallback } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  CheckCircle2,
  Clock,
  ChefHat,
  Bell,
  ArrowLeft,
  QrCode,
} from "lucide-react-native";

const STATUS_STEPS = [
  {
    key: "pending",
    label: "Received",
    icon: Clock,
    color: "#6B7280",
    bg: "#F3F4F6",
  },
  {
    key: "in_progress",
    label: "Preparing",
    icon: ChefHat,
    color: "#F59E0B",
    bg: "#FEF3C7",
  },
  {
    key: "ready",
    label: "Ready!",
    icon: Bell,
    color: "#10B981",
    bg: "#D1FAE5",
  },
  {
    key: "completed",
    label: "Done",
    icon: CheckCircle2,
    color: "#2563EB",
    bg: "#DBEAFE",
  },
];

export default function CustomerOrdersScreen() {
  const { orderId } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchOrder = useCallback(async () => {
    if (!orderId) return;
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      if (!res.ok) throw new Error("Order not found");
      const data = await res.json();
      setOrder(data);
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
    // Poll every 6 seconds for live status
    const interval = setInterval(fetchOrder, 6000);
    return () => clearInterval(interval);
  }, [fetchOrder]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrder();
  };

  const currentStepIndex = STATUS_STEPS.findIndex(
    (s) => s.key === order?.status,
  );
  const currentStep = STATUS_STEPS[currentStepIndex] || STATUS_STEPS[0];
  const CurrentIcon = currentStep.icon;

  return (
    <View
      style={{ flex: 1, backgroundColor: "#F9FAFB", paddingTop: insets.top }}
    >
      <StatusBar style="dark" />

      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 20,
          paddingVertical: 14,
          backgroundColor: "#FFFFFF",
          borderBottomWidth: 1,
          borderColor: "#F3F4F6",
        }}
      >
        <TouchableOpacity
          onPress={() => router.replace("/scan")}
          style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
        >
          <ArrowLeft size={18} color="#374151" />
          <Text style={{ fontSize: 14, color: "#374151", fontWeight: "500" }}>
            Back to Scanner
          </Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 16, fontWeight: "700", color: "#111827" }}>
          Your Order
        </Text>
        <View style={{ width: 60 }} />
      </View>

      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : error ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 32,
          }}
        >
          <Text style={{ fontSize: 40, marginBottom: 12 }}>😕</Text>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: "#111827",
              marginBottom: 8,
            }}
          >
            Couldn't load order
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: "#6B7280",
              textAlign: "center",
              marginBottom: 24,
            }}
          >
            {error}
          </Text>
          <TouchableOpacity
            onPress={fetchOrder}
            style={{
              backgroundColor: "#2563EB",
              borderRadius: 12,
              paddingVertical: 12,
              paddingHorizontal: 24,
            }}
          >
            <Text style={{ color: "#FFFFFF", fontWeight: "600" }}>
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{
            padding: 20,
            paddingBottom: insets.bottom + 40,
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#2563EB"
            />
          }
        >
          {/* Big status card */}
          <View
            style={{
              backgroundColor: currentStep.bg,
              borderRadius: 24,
              padding: 28,
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: 36,
                backgroundColor: "#FFFFFF",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 12,
                shadowColor: "#000",
                shadowOpacity: 0.06,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              <CurrentIcon size={32} color={currentStep.color} />
            </View>
            <Text
              style={{
                fontSize: 22,
                fontWeight: "800",
                color: currentStep.color,
                marginBottom: 6,
              }}
            >
              {currentStep.label}
            </Text>
            <Text
              style={{ fontSize: 13, color: "#6B7280", textAlign: "center" }}
            >
              {order?.status === "pending" &&
                "We received your order! Preparing to start."}
              {order?.status === "in_progress" &&
                "The kitchen is working on your food right now 🍳"}
              {order?.status === "ready" &&
                "Your food is ready! Please collect from the counter 🔔"}
              {order?.status === "completed" &&
                "Enjoy your meal! Thank you for ordering 🎉"}
            </Text>
          </View>

          {/* Progress steps */}
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 16,
              padding: 18,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: "#F3F4F6",
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: "700",
                color: "#9CA3AF",
                marginBottom: 14,
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              Progress
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                justifyContent: "space-between",
              }}
            >
              {STATUS_STEPS.map((step, i) => {
                const done = i <= currentStepIndex;
                const StepIcon = step.icon;
                return (
                  <View
                    key={step.key}
                    style={{ flex: 1, alignItems: "center" }}
                  >
                    <View
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 19,
                        backgroundColor: done ? step.bg : "#F3F4F6",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 6,
                        borderWidth: done ? 1.5 : 0,
                        borderColor: done ? step.color + "50" : "transparent",
                      }}
                    >
                      <StepIcon
                        size={16}
                        color={done ? step.color : "#D1D5DB"}
                      />
                    </View>
                    <Text
                      style={{
                        fontSize: 10,
                        fontWeight: "600",
                        color: done ? "#374151" : "#9CA3AF",
                        textAlign: "center",
                      }}
                    >
                      {step.label}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Order summary */}
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 16,
              padding: 18,
              borderWidth: 1,
              borderColor: "#F3F4F6",
              marginBottom: 16,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 14,
              }}
            >
              <View>
                <Text
                  style={{ fontSize: 15, fontWeight: "700", color: "#111827" }}
                >
                  Order #{order?.id}
                </Text>
                <Text style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>
                  {order?.created_at
                    ? new Date(order.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : ""}
                </Text>
              </View>
              <Text style={{ fontSize: 13, color: "#6B7280" }}>
                {order?.customer_name}
              </Text>
            </View>

            <View style={{ gap: 8, marginBottom: 12 }}>
              {order?.items?.map((item) => (
                <View
                  key={item.id}
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ fontSize: 14, color: "#374151" }}>
                    {item.quantity}× {item.item_name}
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: "#111827",
                    }}
                  >
                    ৳{Number(item.subtotal).toFixed(0)}
                  </Text>
                </View>
              ))}
            </View>

            <View
              style={{
                borderTopWidth: 1,
                borderColor: "#F3F4F6",
                paddingTop: 12,
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <Text
                style={{ fontSize: 15, fontWeight: "700", color: "#111827" }}
              >
                Total
              </Text>
              <Text
                style={{ fontSize: 15, fontWeight: "700", color: "#2563EB" }}
              >
                ৳{Number(order?.total).toFixed(0)}
              </Text>
            </View>
          </View>

          <Text style={{ fontSize: 12, color: "#9CA3AF", textAlign: "center" }}>
            Updates automatically every 6 seconds
          </Text>

          {/* Scan another QR */}
          <TouchableOpacity
            onPress={() => router.replace("/scan")}
            style={{
              marginTop: 20,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              borderWidth: 1,
              borderColor: "#E5E7EB",
              borderRadius: 12,
              paddingVertical: 12,
            }}
          >
            <QrCode size={16} color="#6B7280" />
            <Text style={{ fontSize: 14, color: "#6B7280", fontWeight: "600" }}>
              Scan Another QR Code
            </Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
}
