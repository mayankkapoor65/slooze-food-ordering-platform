"use client";

import React, { useState } from "react";
import { Order, User, OrderStatus } from "../types";

interface OrderLedgerProps {
  orders: Order[];
  loading: boolean;
  currentUser: User | null;
  onPayOrder: (orderId: number) => void;
  onCancelOrder: (orderId: number) => void;
  actionLoadingId: number | null;
}

export function OrderLedger({
  orders,
  loading,
  currentUser,
  onPayOrder,
  onCancelOrder,
  actionLoadingId,
}: OrderLedgerProps) {
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const filteredOrders = orders.filter((order) => {
    return statusFilter === "ALL" || order.status === statusFilter;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "PENDING_PAYMENT":
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
            <span>PENDING PAYMENT</span>
          </span>
        );
      case "PAID":
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>PAID & COMPLETED</span>
          </span>
        );
      case "CANCELLED":
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
            <span>CANCELLED</span>
          </span>
        );
    }
  };

  const formatCurrency = (amount: number, curr: string) => {
    return curr === "INR" ? `₹${amount.toFixed(0)}` : `$${amount.toFixed(2)}`;
  };

  const canManageOrder = (order: Order) => {
    if (!currentUser) return false;
    if (currentUser.role === "ADMIN") return true;
    if (currentUser.role === "MANAGER" && currentUser.country.toLowerCase() === order.country.toLowerCase()) {
      return true;
    }
    return false;
  };

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <span>Corporate Order Ledger</span>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {filteredOrders.length} records
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {currentUser?.country === "Global"
              ? "All regional corporate food orders across the organization."
              : `Showing orders isolated to ${currentUser?.country} under Re-BAC policy.`}
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center space-x-1 bg-slate-900 border border-slate-800 p-1 rounded-xl">
          {["ALL", "PENDING_PAYMENT", "PAID", "CANCELLED"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === st
                  ? "bg-slate-800 text-white shadow-inner"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {st === "ALL" ? "All" : st.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-36 rounded-2xl bg-slate-900 border border-slate-800" />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="py-16 text-center rounded-2xl bg-slate-900/50 border border-slate-800">
          <div className="text-4xl">📋</div>
          <h3 className="text-sm font-bold text-slate-200 mt-3">No orders found in this category</h3>
          <p className="text-xs text-slate-400 mt-1">
            Orders created by employees in {currentUser?.country} will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isManagerAuthorized = canManageOrder(order);
            const isActionLoading = actionLoadingId === Number(order.id);

            return (
              <div
                key={order.id}
                className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-750 transition-all shadow-md space-y-4"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-mono font-bold text-indigo-400">
                      Order #{order.id}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-medium">
                      {order.country === "India" ? "🇮🇳 India" : "🇺🇸 America"}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(order.createdAt).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3">
                    {getStatusBadge(order.status)}
                  </div>
                </div>

                {/* Order Details Grid */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Creator persona & itemized list */}
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center space-x-2 text-xs text-slate-400">
                      <span>Ordered by:</span>
                      <strong className="text-slate-200">
                        {order.user?.name || order.userId}
                      </strong>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {order.user?.role || "MEMBER"}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {order.items.map((it, idx) => (
                        <div
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-slate-850 border border-slate-800 text-xs text-slate-300 flex items-center space-x-1.5"
                        >
                          <span className="text-indigo-400 font-bold">{it.quantity}x</span>
                          <span>{it.menuItem?.name || `Item #${it.menuItemId}`}</span>
                          <span className="text-slate-500 font-mono text-[10px]">
                            ({formatCurrency(it.price * it.quantity, order.currency)})
                          </span>
                        </div>
                      ))}
                    </div>

                    {order.paymentMethod && (
                      <div className="text-xs text-emerald-400/90 pt-1 flex items-center space-x-1">
                        <span>💳 Paid via {order.paymentMethod.methodType}</span>
                        <span className="font-mono text-slate-400">({order.paymentMethod.details})</span>
                      </div>
                    )}
                  </div>

                  {/* Right: Total Amount & Action Controls */}
                  <div className="flex sm:items-center justify-between lg:justify-end gap-5 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                    <div className="text-right">
                      <div className="text-[11px] text-slate-400">Order Total</div>
                      <div className="text-lg font-mono font-extrabold text-white">
                        {formatCurrency(order.totalAmount, order.currency)}
                      </div>
                    </div>

                    {/* RBAC-guarded actions */}
                    {order.status === "PENDING_PAYMENT" && (
                      <div className="flex items-center space-x-2">
                        {isManagerAuthorized ? (
                          <>
                            <button
                              onClick={() => onPayOrder(Number(order.id))}
                              disabled={isActionLoading}
                              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-900/50 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center space-x-1.5 cursor-pointer"
                            >
                              <span>Approve & Pay</span>
                            </button>
                            <button
                              onClick={() => onCancelOrder(Number(order.id))}
                              disabled={isActionLoading}
                              className="px-3 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 hover:text-white text-xs font-bold border border-rose-800/40 transition-all cursor-pointer"
                            >
                              <span>Cancel</span>
                            </button>
                          </>
                        ) : (
                          <div className="px-3 py-1.5 rounded-xl bg-slate-850 border border-slate-800 text-[11px] text-slate-400 flex items-center space-x-1.5">
                            <span>🔒</span>
                            <span>Checkout requires Manager / Admin Role</span>
                          </div>
                        )}
                      </div>
                    )}

                    {order.status === "PAID" && isManagerAuthorized && (
                      <button
                        onClick={() => onCancelOrder(Number(order.id))}
                        disabled={isActionLoading}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/40 hover:text-rose-300 text-slate-400 text-xs font-medium border border-slate-700 transition-all cursor-pointer"
                        title="Cancel / Refund Order"
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
