"use client";
import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Clock,
  ChefHat,
  BellRing,
  ArrowLeft,
} from "lucide-react";

const STATUS_STEPS = [
  {
    key: "pending",
    label: "Order Received",
    icon: Clock,
    color: "text-gray-500",
    bg: "bg-gray-100",
    ring: "ring-gray-300",
  },
  {
    key: "in_progress",
    label: "Preparing",
    icon: ChefHat,
    color: "text-amber-500",
    bg: "bg-amber-50",
    ring: "ring-amber-300",
  },
  {
    key: "ready",
    label: "Ready!",
    icon: BellRing,
    color: "text-green-500",
    bg: "bg-green-50",
    ring: "ring-green-300",
  },
  {
    key: "completed",
    label: "Completed",
    icon: CheckCircle2,
    color: "text-blue-500",
    bg: "bg-blue-50",
    ring: "ring-blue-300",
  },
];

export default function OrderStatusPage({ params }) {
  const { orderId } = params;
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      if (!res.ok) throw new Error("Order not found");
      const data = await res.json();
      setOrder(data);
    } catch (e) {
      setError(e.message);
    }
  };

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 6000);
    return () => clearInterval(interval);
  }, [orderId]);

  const currentIndex =
    STATUS_STEPS.findIndex((s) => s.key === order?.status) ?? 0;

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <a href="/" className="text-blue-600 underline text-sm">
            Go back
          </a>
        </div>
      </div>
    );

  if (!order)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div
            className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-3"
            style={{ animation: "spin 1s linear infinite" }}
          ></div>
          <p className="text-gray-500 text-sm">Loading your order...</p>
        </div>
        <style jsx global>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );

  const currentStep = STATUS_STEPS[currentIndex] || STATUS_STEPS[0];
  const CurrentIcon = currentStep.icon;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4">
        <a
          href="javascript:history.back()"
          className="inline-flex items-center gap-1.5 text-gray-500 text-sm"
        >
          <ArrowLeft size={16} />
          Back
        </a>
        <h1 className="text-xl font-bold text-gray-900 mt-1">Order Status</h1>
      </div>

      <div className="px-4 py-6 space-y-6 max-w-md mx-auto">
        {/* Big status indicator */}
        <div className={`${currentStep.bg} rounded-3xl p-8 text-center`}>
          <div
            className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${currentStep.bg} ring-4 ${currentStep.ring} mb-4`}
          >
            <CurrentIcon size={36} className={currentStep.color} />
          </div>
          <h2 className={`text-2xl font-bold ${currentStep.color}`}>
            {currentStep.label}
          </h2>
          <p className="text-gray-500 text-sm mt-2">
            {order.status === "pending" &&
              "We received your order and will start preparing it shortly."}
            {order.status === "in_progress" &&
              "Our kitchen is working on your order right now!"}
            {order.status === "ready" &&
              "Your order is ready! Please collect it from the counter."}
            {order.status === "completed" &&
              "Enjoy your meal! Thank you for ordering with us."}
          </p>
        </div>

        {/* Progress stepper */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-start justify-between">
            {STATUS_STEPS.map((step, i) => {
              const isDone = i <= currentIndex;
              const StepIcon = step.icon;
              return (
                <div
                  key={step.key}
                  className="flex flex-col items-center flex-1"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all ${isDone ? `${step.bg} ring-2 ${step.ring}` : "bg-gray-100"}`}
                  >
                    <StepIcon
                      size={18}
                      className={isDone ? step.color : "text-gray-400"}
                    />
                  </div>
                  <p
                    className={`text-xs text-center font-medium ${isDone ? "text-gray-900" : "text-gray-400"}`}
                  >
                    {step.label}
                  </p>
                  {i < STATUS_STEPS.length - 1 && <div className="hidden" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Order summary */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-gray-900">Order #{order.id}</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {new Date(order.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <p className="text-sm text-gray-500">
              Customer:{" "}
              <span className="font-semibold text-gray-900">
                {order.customer_name}
              </span>
            </p>
          </div>

          <div className="space-y-2 mb-4">
            {order.items?.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {item.quantity}x {item.item_name}
                </span>
                <span className="font-medium text-gray-900">
                  ৳{Number(item.subtotal).toFixed(0)}
                </span>
              </div>
            ))}
          </div>

          <div className="flex justify-between font-bold text-gray-900 border-t border-gray-100 pt-3">
            <span>Total</span>
            <span>৳{Number(order.total).toFixed(0)}</span>
          </div>
        </div>

        <p className="text-xs text-center text-gray-400">
          This page refreshes automatically every 6 seconds
        </p>
      </div>
    </div>
  );
}
