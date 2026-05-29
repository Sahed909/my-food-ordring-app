import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Animated,
  Alert,
} from "react-native";
import { useState, useEffect, useRef, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeftRight, Printer, Trash2, LogOut } from "lucide-react-native";
import { useRouter } from "expo-router";
import * as Linking from "expo-linking";
import {
  getRestaurantId,
  clearRestaurantIdCache,
} from "@/utils/getRestaurantId";
import { useAuth } from "@/utils/auth/useAuth";

const BASE_URL =
  process.env.EXPO_PUBLIC_BASE_URL ||
  process.env.EXPO_PUBLIC_PROXY_BASE_URL ||
  "";

export default function OrdersTab() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signOut } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const opacityMap = useRef({});

  const getOpacity = useCallback((order) => {
    if (!opacityMap.current[order.id]) {
      opacityMap.current[order.id] = new Animated.Value(
        order.status === "completed" ? 0.35 : 1,
      );
    }
    return opacityMap.current[order.id];
  }, []);

  const animateComplete = useCallback((orderId) => {
    const anim = opacityMap.current[orderId];
    if (anim) {
      Animated.timing(anim, {
        toValue: 0.35,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }
  }, []);

  const animateRestore = useCallback((orderId) => {
    const anim = opacityMap.current[orderId];
    if (anim) {
      Animated.timing(anim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const id = await getRestaurantId();
      if (id) {
        const res = await fetch(`/api/orders?restaurant_id=${id}`);
        const data = await res.json();
        const newOrders = data || [];

        newOrders.forEach((order) => {
          if (!opacityMap.current[order.id]) {
            opacityMap.current[order.id] = new Animated.Value(
              order.status === "completed" ? 0.35 : 1,
            );
          }
        });

        setOrders(newOrders);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const updateStatus = async (order, status) => {
    try {
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status } : o)),
      );
      if (status === "completed") {
        animateComplete(order.id);
      } else {
        animateRestore(order.id);
      }

      await fetch(`/api/orders/${order.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
    } catch (e) {
      Alert.alert("Error", "Could not update order status");
      loadData();
    }
  };

  const deleteOrder = (orderId) => {
    Alert.alert("Delete Order", "Are you sure you want to delete this order?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            setOrders((prev) => prev.filter((o) => o.id !== orderId));
            await fetch(`/api/orders/${orderId}`, { method: "DELETE" });
          } catch (e) {
            Alert.alert("Error", "Could not delete order");
            loadData();
          }
        },
      },
    ]);
  };

  const printOrder = async (orderId) => {
    const url = `${BASE_URL}/api/print-order/${orderId}`;
    await Linking.openURL(url);
  };

  const switchMode = async () => {
    await AsyncStorage.removeItem("app_mode");
    router.replace("/mode-select");
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("app_mode");
    await AsyncStorage.removeItem("restaurant_id");
    clearRestaurantIdCache();
    signOut();
    router.replace("/mode-select");
  };

  const statusConfig = {
    pending: { label: "Pending", color: "#6B7280" },
    in_progress: { label: "Preparing", color: "#F59E0B" },
    ready: { label: "Ready", color: "#10B981" },
    completed: { label: "Completed", color: "#2563EB" },
  };

  const renderStatusBar = (order) => {
    const steps = ["pending", "in_progress", "ready", "completed"];
    return (
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 6,
          marginTop: 10,
        }}
      >
        {steps.map((s) => {
          const cfg = statusConfig[s];
          const isActive = order.status === s;
          return (
            <TouchableOpacity
              key={s}
              onPress={() => !isActive && updateStatus(order, s)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: isActive ? cfg.color : "#E5E7EB",
                backgroundColor: isActive ? cfg.color + "18" : "#FFFFFF",
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color: isActive ? cfg.color : "#9CA3AF",
                }}
              >
                {cfg.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  if (loading) {
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

  return (
    <View style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 8,
          paddingHorizontal: 20,
          paddingBottom: 12,
          backgroundColor: "#FFFFFF",
          borderBottomWidth: 1,
          borderColor: "#F3F4F6",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text style={{ fontSize: 22, fontWeight: "800", color: "#111827" }}>
          Live Orders
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <TouchableOpacity
            onPress={switchMode}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: "#E5E7EB",
            }}
          >
            <ArrowLeftRight size={13} color="#6B7280" />
            <Text style={{ fontSize: 12, color: "#6B7280", fontWeight: "600" }}>
              Switch
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleLogout}
            style={{
              padding: 8,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: "#FEE2E2",
              backgroundColor: "#FFF5F5",
            }}
          >
            <LogOut size={14} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: insets.bottom + 100,
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
        {orders.length === 0 ? (
          <View style={{ alignItems: "center", paddingTop: 60 }}>
            <Text
              style={{ fontSize: 16, color: "#9CA3AF", textAlign: "center" }}
            >
              No orders yet.{"\n"}Pull to refresh.
            </Text>
          </View>
        ) : (
          orders.map((order) => {
            const opacity = getOpacity(order);
            return (
              <Animated.View
                key={order.id}
                style={{
                  opacity,
                  backgroundColor: "#FFFFFF",
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: "#F3F4F6",
                }}
              >
                {/* Top row */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 10,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: "700",
                        color: "#111827",
                      }}
                    >
                      {order.customer_name}
                    </Text>
                    <Text
                      style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}
                    >
                      {new Date(order.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "700",
                      color: "#2563EB",
                      marginRight: 10,
                    }}
                  >
                    ৳{Number(order.total).toFixed(0)}
                  </Text>
                  <TouchableOpacity
                    onPress={() => printOrder(order.id)}
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 8,
                      backgroundColor: "#F3F4F6",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Printer size={16} color="#6B7280" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => deleteOrder(order.id)}
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 8,
                      backgroundColor: "#FEF2F2",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Trash2 size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>

                {/* Items */}
                <View style={{ gap: 4, marginBottom: 6 }}>
                  {order.items?.map((item) => (
                    <View
                      key={item.id}
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text style={{ fontSize: 13, color: "#374151" }}>
                        {item.quantity}× {item.item_name}
                      </Text>
                      <Text style={{ fontSize: 13, color: "#9CA3AF" }}>
                        ৳{Number(item.subtotal).toFixed(0)}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Notes */}
                {order.notes ? (
                  <Text
                    style={{
                      fontSize: 12,
                      color: "#6B7280",
                      fontStyle: "italic",
                      marginBottom: 4,
                    }}
                  >
                    Note: {order.notes}
                  </Text>
                ) : null}

                {/* Status buttons */}
                {renderStatusBar(order)}
              </Animated.View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}
