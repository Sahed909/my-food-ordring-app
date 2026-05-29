"use client";
import { useState, useEffect, useMemo } from "react";
import { ShoppingCart, Plus, Minus, X, CheckCircle2 } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";

export default function OrderPage({ params }) {
  const { qrId } = params;

  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [notes, setNotes] = useState("");
  const [placedOrderId, setPlacedOrderId] = useState(null);

  // Auto-redirect to order status page 2s after order is placed
  useEffect(() => {
    if (!placedOrderId) return;
    const timer = setTimeout(() => {
      window.location.href = `/order-status/${placedOrderId}`;
    }, 2000);
    return () => clearTimeout(timer);
  }, [placedOrderId]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["menu", qrId],
    queryFn: async () => {
      const res = await fetch(`/api/menu/${qrId}`);
      if (!res.ok) throw new Error("Menu not found or QR code expired");
      return res.json();
    },
  });

  const submitOrder = useMutation({
    mutationFn: async (orderData) => {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to submit order");
      }
      return res.json();
    },
    onSuccess: (data) => {
      setPlacedOrderId(data.id);
      setCart([]);
      setIsCartOpen(false);
      // Notify the native app (WebView context) so it can navigate to order tracking
      if (typeof window !== "undefined" && window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(
          JSON.stringify({ type: "order_placed", orderId: data.id }),
        );
      }
    },
  });

  const restaurant = data?.restaurant;
  const menuItems = data?.menuItems || [];

  const categories = useMemo(() => {
    const cats = new Set(menuItems.map((item) => item.category || "Menu"));
    return Array.from(cats);
  }, [menuItems]);

  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing)
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQ = item.quantity + delta;
            return newQ > 0 ? { ...item, quantity: newQ } : null;
          }
          return item;
        })
        .filter(Boolean),
    );
  };

  const cartTotal = cart.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0,
  );

  const handleCheckout = () => {
    if (!customerName.trim()) {
      alert("Please enter your name");
      return;
    }
    submitOrder.mutate({
      qr_code_id: data.qrCode.id,
      restaurant_id: restaurant.id,
      customer_name: customerName,
      notes: notes,
      total: cartTotal,
      items: cart.map((item) => ({
        menu_item_id: item.id,
        item_name: item.name,
        item_price: item.price,
        quantity: item.quantity,
        subtotal: Number(item.price) * item.quantity,
      })),
    });
  };

  // ── Loading / Error states ──────────────────────────────────────────
  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div
            style={{
              width: 40,
              height: 40,
              border: "3px solid #E5E7EB",
              borderTopColor: "#2563EB",
              borderRadius: "50%",
              animation: "qr-spin 0.8s linear infinite",
              margin: "0 auto 16px",
            }}
          />
          <p className="text-gray-500">Loading menu...</p>
        </div>
        <style jsx global>{`
          @keyframes qr-spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-4">😕</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Oops!</h2>
          <p className="text-gray-500">{error.message}</p>
        </div>
      </div>
    );

  // ── Order Placed success screen ─────────────────────────────────────
  if (placedOrderId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-sm">
          <div className="flex items-center justify-center mb-4">
            <CheckCircle2 size={64} className="text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Order Placed!
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Your order has been sent to{" "}
            <span className="font-semibold text-gray-700">
              {restaurant?.name}
            </span>
            . Taking you to your order status...
          </p>
          <div className="flex justify-center">
            <div
              style={{
                width: 24,
                height: 24,
                border: "2px solid #2563EB",
                borderTopColor: "transparent",
                borderRadius: "50%",
                animation: "qr-spin 0.8s linear infinite",
              }}
            />
          </div>
          <a
            href={`/order-status/${placedOrderId}`}
            className="block mt-4 text-sm text-blue-600 underline"
          >
            Click here if not redirected
          </a>
        </div>
        <style jsx global>{`
          @keyframes qr-spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  // ── Main menu page ──────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-10">
        <h1 className="text-xl font-bold text-gray-900">{restaurant?.name}</h1>
        <p className="text-sm text-gray-500">
          Browse the menu and place your order
        </p>
      </div>

      {/* Menu Categories */}
      <div className="px-4 py-4 space-y-8">
        {categories.map((category) => (
          <div key={category}>
            <h2 className="text-lg font-bold text-gray-900 mb-3">{category}</h2>
            <div className="space-y-3">
              {menuItems
                .filter((item) => (item.category || "Menu") === category)
                .map((item) => {
                  const inCart = cart.find((c) => c.id === item.id);
                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-start justify-between gap-3"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {item.name}
                        </h3>
                        <p className="text-blue-600 font-bold text-sm mt-0.5">
                          ৳{Number(item.price).toFixed(0)}
                        </p>
                        {item.description && (
                          <p className="text-gray-500 text-xs mt-1 leading-relaxed">
                            {item.description}
                          </p>
                        )}
                      </div>
                      <div className="flex-shrink-0 mt-1">
                        {inCart ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-600"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="font-semibold w-4 text-center text-gray-900">
                              {inCart.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-600 text-white"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => addToCart(item)}
                            className="bg-blue-50 text-blue-600 rounded-full px-4 py-1.5 text-sm font-medium inline-flex items-center gap-1.5 hover:bg-blue-100 transition-colors"
                          >
                            <Plus size={14} />
                            Add
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
      </div>

      {/* Floating Cart Bar */}
      {cart.length > 0 && !isCartOpen && (
        <div className="fixed bottom-0 left-0 right-0 p-4 z-20">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-blue-600 text-white rounded-xl py-3 px-4 flex items-center justify-between font-semibold shadow-lg"
          >
            <div className="flex items-center gap-2">
              <ShoppingCart size={18} />
              <span className="bg-white text-blue-600 rounded-full w-5 h-5 text-xs flex items-center justify-center font-bold">
                {cart.reduce((s, i) => s + i.quantity, 0)}
              </span>
            </div>
            <span>View Order</span>
            <span>৳{cartTotal.toFixed(0)}</span>
          </button>
        </div>
      )}

      {/* Checkout Sheet */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 flex items-end">
          <div className="bg-white rounded-t-3xl w-full max-h-[85vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">Your Order</h2>
              <button
                onClick={() => setIsCartOpen(false)}
                className="text-gray-400 hover:text-gray-900"
              >
                <X size={20} />
              </button>
            </div>

            {/* Cart Items */}
            <div className="space-y-3 mb-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      {item.name}
                    </p>
                    <p className="text-gray-500 text-xs">
                      ৳{Number(item.price).toFixed(0)} x {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold text-gray-900 text-sm">
                    ৳{(Number(item.price) * item.quantity).toFixed(0)}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex justify-between font-bold text-gray-900 border-t border-gray-100 pt-3 mb-5">
              <span>Total</span>
              <span>৳{cartTotal.toFixed(0)}</span>
            </div>

            {/* Form */}
            <div className="space-y-3 mb-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name
                </label>
                <input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special requests..."
                  rows={2}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                />
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={submitOrder.isPending}
              className="w-full bg-blue-600 text-white rounded-xl py-3 font-semibold disabled:opacity-60"
            >
              {submitOrder.isPending
                ? "Placing Order..."
                : `Place Order · ৳${cartTotal.toFixed(0)}`}
            </button>

            {submitOrder.isError && (
              <p className="text-red-500 text-sm text-center mt-2">
                {submitOrder.error.message}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
