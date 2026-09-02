"use client";

import React, { useState } from "react";
import { PaymentMethod, User } from "../types";

interface PaymentSettingsProps {
  paymentMethods: PaymentMethod[];
  currentUser: User | null;
  onUpdatePaymentMethod: (id: number, methodType: string, details: string) => Promise<void>;
  loading: boolean;
}

export function PaymentSettings({
  paymentMethods,
  currentUser,
  onUpdatePaymentMethod,
  loading,
}: PaymentSettingsProps) {
  const [editingPm, setEditingPm] = useState<PaymentMethod | null>(null);
  const [methodType, setMethodType] = useState("");
  const [details, setDetails] = useState("");
  const [saving, setSaving] = useState(false);

  const isAdmin = currentUser?.role === "ADMIN";

  const handleStartEdit = (pm: PaymentMethod) => {
    setEditingPm(pm);
    setMethodType(pm.methodType);
    setDetails(pm.details);
  };

  const handleSave = async () => {
    if (!editingPm) return;
    setSaving(true);
    try {
      await onUpdatePaymentMethod(Number(editingPm.id), methodType, details);
      setEditingPm(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center space-x-2">
          <span>Corporate Payment Gateways</span>
          <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            {paymentMethods.length} channels
          </span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Corporate payment accounts automatically charged when managers approve orders.
        </p>
      </div>

      {/* RBAC Notice Banner */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-start space-x-3 text-xs">
        <div className="text-lg">🔐</div>
        <div>
          <strong className="text-slate-200">Access Policy: Payment Configuration</strong>
          <p className="text-slate-400 mt-0.5">
            {isAdmin ? (
              <span className="text-emerald-300">
                You are logged in as <strong>Admin ({currentUser?.name})</strong>. You have exclusive authorization to update corporate payment accounts.
              </span>
            ) : (
              <span className="text-amber-300">
                You are logged in as <strong>{currentUser?.name} ({currentUser?.role})</strong>. Updating payment channels is restricted to Admin (Nick Fury).
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Payment Methods Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {paymentMethods.map((pm) => (
          <div
            key={pm.id}
            className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 text-slate-200 border border-slate-700">
                  {pm.country === "India" ? "🇮🇳 India Account" : "🇺🇸 America Account"}
                </span>
                <span className="text-xs font-mono font-bold text-emerald-400 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>ACTIVE</span>
                </span>
              </div>

              <div>
                <h4 className="text-base font-bold text-white">{pm.methodType}</h4>
                <div className="mt-1 p-2.5 rounded-xl bg-slate-950 font-mono text-xs text-indigo-300 border border-slate-800/80">
                  {pm.details}
                </div>
              </div>
            </div>

            {/* Action */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Channel ID: #{pm.id}</span>
              {isAdmin ? (
                <button
                  onClick={() => handleStartEdit(pm)}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  Edit Channel
                </button>
              ) : (
                <span className="text-[10px] text-slate-500 font-mono">🔒 Admin Only</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal (Admin Only) */}
      {editingPm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">
                Update Payment Channel ({editingPm.country})
              </h3>
              <button
                onClick={() => setEditingPm(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Method Type
                </label>
                <input
                  type="text"
                  value={methodType}
                  onChange={(e) => setMethodType(e.target.value)}
                  placeholder="e.g. Corporate UPI AutoPay, Amex Centurion"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Payment Details (VPA / Masked Card / Acc)
                </label>
                <input
                  type="text"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="e.g. corporate@hdfc, Visa (*4242)"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setEditingPm(null)}
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md"
              >
                {saving ? "Saving Changes..." : "Save Payment Method"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
