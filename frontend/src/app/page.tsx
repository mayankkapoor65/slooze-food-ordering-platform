"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import {
  GET_USERS,
  GET_ME,
  GET_DASHBOARD_DATA,
  GET_ADMIN_ANALYTICS,
  CREATE_ORDER,
  PAY_ORDER,
  CANCEL_ORDER,
  UPDATE_PAYMENT_METHOD,
} from "./graphql-queries";
import { User, Restaurant, MenuItem, CartItem, Order, PaymentMethod, AdminAnalytics } from "../types";
import { Navbar } from "../components/Navbar";
import { PersonaSwitcherModal } from "../components/PersonaSwitcherModal";
import { RBACBanner } from "../components/RBACBanner";
import { RestaurantGrid } from "../components/RestaurantGrid";
import { MenuModal } from "../components/MenuModal";
import { CartDrawer } from "../components/CartDrawer";
import { OrderLedger } from "../components/OrderLedger";
import { PaymentSettings } from "../components/PaymentSettings";
import { AdminStats } from "../components/AdminStats";
import { LoginScreen } from "../components/LoginScreen";

export default function Home() {
  const [activeUserId, setActiveUserId] = useState<string>("");
  const [isClient, setIsClient] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"restaurants" | "orders" | "payments" | "analytics">("restaurants");
  
  // Modals & Drawers
  const [isPersonaModalOpen, setIsPersonaModalOpen] = useState<boolean>(false);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);

  // Cart state
  const [cart, setCart] = useState<{ [id: string]: CartItem }>({});

  // Feedback notifications
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const showAlert = (type: "success" | "error", message: string) => {
    setAlert({ type, message });
    setTimeout(() => {
      setAlert(null);
    }, 4500);
  };

  // 1. Initial Client Mount & Session Check
  useEffect(() => {
    setIsClient(true);
    const storedId = localStorage.getItem("slooze_user_id");
    if (storedId) {
      setActiveUserId(storedId);
    }
  }, []);

  // 2. GraphQL Queries
  const { data: usersData, loading: usersLoading, refetch: refetchUsers } = useQuery<{ users: User[] }>(GET_USERS, {
    skip: !isClient,
  });

  const { data: meData, loading: meLoading, refetch: refetchMe } = useQuery<{ me: User }>(GET_ME, {
    skip: !isClient || !activeUserId,
    context: {
      headers: {
        "X-User-Id": activeUserId,
      },
    },
  });

  const {
    data: dashboardData,
    loading: dashboardLoading,
    refetch: refetchDashboard,
  } = useQuery<{
    restaurants: Restaurant[];
    orders: Order[];
    paymentMethods: PaymentMethod[];
  }>(GET_DASHBOARD_DATA, {
    skip: !isClient || !activeUserId,
    context: {
      headers: {
        "X-User-Id": activeUserId,
      },
    },
  });

  const { data: analyticsData, loading: analyticsLoading, refetch: refetchAnalytics } = useQuery<{
    adminAnalytics: AdminAnalytics;
  }>(GET_ADMIN_ANALYTICS, {
    skip: !isClient || !activeUserId || meData?.me?.role !== "ADMIN",
    context: {
      headers: {
        "X-User-Id": activeUserId,
      },
    },
  });

  // 3. GraphQL Mutations
  const [createOrderMutation, { loading: createOrderLoading }] = useMutation<{ createOrder: Order }>(CREATE_ORDER, {
    context: {
      headers: {
        "X-User-Id": activeUserId,
      },
    },
  });

  const [payOrderMutation] = useMutation<{ payOrder: Order }>(PAY_ORDER, {
    context: {
      headers: {
        "X-User-Id": activeUserId,
      },
    },
  });

  const [cancelOrderMutation] = useMutation<{ cancelOrder: Order }>(CANCEL_ORDER, {
    context: {
      headers: {
        "X-User-Id": activeUserId,
      },
    },
  });

  const [updatePaymentMethodMutation] = useMutation<{ updatePaymentMethod: PaymentMethod }>(UPDATE_PAYMENT_METHOD, {
    context: {
      headers: {
        "X-User-Id": activeUserId,
      },
    },
  });

  // Persona Switch Handler
  const handleSelectUser = (userId: string) => {
    localStorage.setItem("slooze_user_id", userId);
    setActiveUserId(userId);
    setCart({}); // Reset cart on user switch to prevent cross-region item leaks
    showAlert("success", `Switched active persona to ${userId.replace("_", " ").toUpperCase()}`);
    setTimeout(() => {
      refetchMe();
      refetchDashboard();
    }, 100);
  };

  const handleLogout = () => {
    localStorage.removeItem("slooze_user_id");
    setActiveUserId("");
    setCart({});
    setIsPersonaModalOpen(false);
    showAlert("success", "Logged out securely. Session ended.");
  };

  // Cart Operations
  const handleAddToCart = (item: MenuItem) => {
    setCart((prev) => {
      const current = prev[item.id];
      const newQty = (current?.quantity || 0) + 1;
      return {
        ...prev,
        [item.id]: {
          item,
          quantity: newQty,
        },
      };
    });
  };

  const handleRemoveFromCart = (itemId: number | string) => {
    setCart((prev) => {
      const current = prev[itemId];
      if (!current) return prev;
      if (current.quantity <= 1) {
        const copy = { ...prev };
        delete copy[itemId];
        return copy;
      }
      return {
        ...prev,
        [itemId]: {
          ...current,
          quantity: current.quantity - 1,
        },
      };
    });
  };

  const handleClearCart = () => {
    setCart({});
  };

  // Order Submission
  const handleCheckout = async () => {
    const items = Object.values(cart);
    if (items.length === 0) return;

    const user = meData?.me;
    if (!user) return;

    // Detect country from the items in cart or user country
    const targetCountry = user.country === "Global" ? (items[0].item.currency === "INR" ? "India" : "America") : user.country;

    try {
      const orderPayload = items.map((i) => ({
        menuItemId: Number(i.item.id),
        quantity: i.quantity,
      }));

      const res = await createOrderMutation({
        variables: {
          country: targetCountry,
          items: orderPayload,
        },
      });

      if (res.data?.createOrder) {
        showAlert(
          "success",
          `Order #${res.data.createOrder.id} created successfully (${res.data.createOrder.status})!`
        );
        setCart({});
        setIsCartOpen(false);
        setActiveTab("orders");
        refetchDashboard();
        if (user.role === "ADMIN") refetchAnalytics();
      }
    } catch (err: any) {
      showAlert("error", err.message || "Failed to create order.");
    }
  };

  // Approve & Pay
  const handlePayOrder = async (orderId: number) => {
    setActionLoadingId(orderId);
    try {
      const res = await payOrderMutation({
        variables: { orderId },
      });
      if (res.data?.payOrder) {
        showAlert("success", `Order #${orderId} approved and paid via corporate account!`);
        refetchDashboard();
        if (meData?.me?.role === "ADMIN") refetchAnalytics();
      }
    } catch (err: any) {
      showAlert("error", err.message || "Failed to pay order.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Cancel Order
  const handleCancelOrder = async (orderId: number) => {
    setActionLoadingId(orderId);
    try {
      const res = await cancelOrderMutation({
        variables: { orderId },
      });
      if (res.data?.cancelOrder) {
        showAlert("success", `Order #${orderId} marked as CANCELLED.`);
        refetchDashboard();
        if (meData?.me?.role === "ADMIN") refetchAnalytics();
      }
    } catch (err: any) {
      showAlert("error", err.message || "Failed to cancel order.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Update Payment Method
  const handleUpdatePaymentMethod = async (id: number, methodType: string, details: string) => {
    try {
      const res = await updatePaymentMethodMutation({
        variables: { id, methodType, details },
      });
      if (res.data?.updatePaymentMethod) {
        showAlert("success", `Payment channel #${id} updated successfully!`);
        refetchDashboard();
      }
    } catch (err: any) {
      showAlert("error", err.message || "Failed to update payment method.");
      throw err;
    }
  };

  const currentUser = meData?.me || null;
  const users = usersData?.users || [];
  const restaurants = dashboardData?.restaurants || [];
  const orders = dashboardData?.orders || [];
  const paymentMethods = dashboardData?.paymentMethods || [];
  const analytics = analyticsData?.adminAnalytics || null;

  const totalCartCount = Object.values(cart).reduce((sum, i) => sum + i.quantity, 0);

  if (!isClient) return null;

  // Render Login Screen if not authenticated
  if (!activeUserId) {
    return (
      <LoginScreen
        users={users}
        onLogin={handleSelectUser}
        loading={usersLoading}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col justify-between">
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenPersonaModal={() => setIsPersonaModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Floating Notification Toast */}
      {alert && (
        <div className="fixed top-20 right-6 z-50 animate-slide-up">
          <div
            className={`px-4 py-3 rounded-xl border shadow-xl flex items-center space-x-3 text-xs font-semibold ${
              alert.type === "success"
                ? "bg-emerald-950/90 border-emerald-500/50 text-emerald-200"
                : "bg-rose-950/90 border-rose-500/50 text-rose-200"
            }`}
          >
            <span>{alert.type === "success" ? "✅" : "⚠️"}</span>
            <span>{alert.message}</span>
            <button onClick={() => setAlert(null)} className="ml-2 text-slate-400 hover:text-white">
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* RBAC Capability Banner */}
        <RBACBanner
          currentUser={currentUser}
          onOpenPersonaModal={() => setIsPersonaModalOpen(true)}
        />

        {/* Tab Views */}
        {activeTab === "restaurants" && (
          <RestaurantGrid
            restaurants={restaurants}
            loading={dashboardLoading}
            onSelectRestaurant={(r) => setSelectedRestaurant(r)}
            userCountry={currentUser?.country || "Global"}
          />
        )}

        {activeTab === "orders" && (
          <OrderLedger
            orders={orders}
            loading={dashboardLoading}
            currentUser={currentUser}
            onPayOrder={handlePayOrder}
            onCancelOrder={handleCancelOrder}
            actionLoadingId={actionLoadingId}
          />
        )}

        {activeTab === "payments" && (
          <PaymentSettings
            paymentMethods={paymentMethods}
            currentUser={currentUser}
            onUpdatePaymentMethod={handleUpdatePaymentMethod}
            loading={dashboardLoading}
          />
        )}

        {activeTab === "analytics" && currentUser?.role === "ADMIN" && (
          <AdminStats
            analytics={analytics}
            loading={analyticsLoading}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 bg-slate-950/60 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <span>Slooze Food Ordering Platform • Role-Based (RBAC) & Relational Access Control (Re-BAC)</span>
          </div>
          <div className="font-mono text-[11px] text-slate-400">
            Next.js App Router • FastAPI Strawberry GraphQL • SQLite
          </div>
        </div>
      </footer>

      {/* Persona Switcher Modal */}
      <PersonaSwitcherModal
        isOpen={isPersonaModalOpen}
        onClose={() => setIsPersonaModalOpen(false)}
        users={users}
        currentUserId={activeUserId}
        onSelectUser={handleSelectUser}
        onLogout={handleLogout}
      />

      {/* Menu Modal */}
      <MenuModal
        restaurant={selectedRestaurant}
        isOpen={!!selectedRestaurant}
        onClose={() => setSelectedRestaurant(null)}
        cart={cart}
        onAddToCart={handleAddToCart}
        onRemoveFromCart={handleRemoveFromCart}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onAddToCart={handleAddToCart}
        onRemoveFromCart={handleRemoveFromCart}
        onClearCart={handleClearCart}
        onCheckout={handleCheckout}
        currentUser={currentUser}
        loading={createOrderLoading}
      />
    </div>
  );
}
