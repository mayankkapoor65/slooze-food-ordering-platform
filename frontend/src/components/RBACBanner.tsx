"use client";

import React from "react";
import { User } from "../types";

interface RBACBannerProps {
  currentUser: User | null;
  onOpenPersonaModal: () => void;
}

export function RBACBanner({ currentUser, onOpenPersonaModal }: RBACBannerProps) {
  if (!currentUser) return null;

  const isRole = (role: string) => currentUser.role === role;

  const permissions = [
    {
      title: "View Menu Items",
      allowed: true,
      desc: "All roles can browse menus in their country.",
    },
    {
      title: "Create Order",
      allowed: true,
      desc: "All roles can assemble and submit order carts.",
    },
    {
      title: "Checkout & Pay",
      allowed: isRole("ADMIN") || isRole("MANAGER"),
      desc: isRole("MEMBER")
        ? "Restricted: Members require Manager or Admin approval."
        : "Authorized: Can approve pending orders with corporate payment.",
    },
    {
      title: "Cancel Order",
      allowed: isRole("ADMIN") || isRole("MANAGER"),
      desc: isRole("MEMBER")
        ? "Restricted: Members cannot cancel existing orders."
        : "Authorized: Can cancel orders in regional ledger.",
    },
    {
      title: "Modify Payment Methods",
      allowed: isRole("ADMIN"),
      desc: isRole("ADMIN")
        ? "Authorized: Admin has exclusive rights to configure payment channels."
        : "Restricted: Only Nick Fury (Admin) can update payment gateways.",
    },
  ];

  return (
    <div className="mb-8 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900/90 via-slate-900/50 to-indigo-950/30 p-5 shadow-lg">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Left identity card */}
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-2xl shadow-inner">
            {currentUser.country === "India" ? "🇮🇳" : currentUser.country === "America" ? "🇺🇸" : "🌐"}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-white">
                Active Session: <span className="text-indigo-300">{currentUser.name}</span>
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {currentUser.role}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Regional Scope (Re-BAC): <strong className="text-slate-200">{currentUser.country}</strong>{" "}
              {currentUser.role !== "ADMIN" && "— restricted to local country data & restaurants."}
            </p>
          </div>
        </div>

        {/* Right switcher CTA */}
        <div>
          <button
            onClick={onOpenPersonaModal}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 hover:border-slate-600 transition-all flex items-center space-x-2 cursor-pointer"
          >
            <span>🔐 Switch Account (Verify Key)</span>
          </button>
        </div>
      </div>

      {/* Permissions Matrix Pills */}
      <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {permissions.map((perm, idx) => (
          <div
            key={idx}
            className={`p-2.5 rounded-xl border flex flex-col justify-between transition-all ${
              perm.allowed
                ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
                : "bg-rose-950/20 border-rose-500/20 text-slate-400"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">{perm.title}</span>
              <span className="text-xs">{perm.allowed ? "✅" : "❌"}</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 leading-tight">{perm.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
