"use client";

import React from "react";
import { AdminAnalytics } from "../types";

interface AdminStatsProps {
  analytics: AdminAnalytics | null;
  loading: boolean;
}

export function AdminStats({ analytics, loading }: AdminStatsProps) {
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-64 bg-slate-800 rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-28 rounded-2xl bg-slate-900 border border-slate-800" />
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title */}
      <div>
        <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center space-x-2">
          <span>Executive Operations Dashboard</span>
          <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-purple-900/50 text-purple-300 border border-purple-700/50">
            Admin View
          </span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Real-time organizational food ordering metrics across India and America regions.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400 font-medium">Total Orders Placed</div>
          <div className="text-2xl font-extrabold font-mono text-white">{analytics.totalOrders}</div>
          <div className="text-[11px] text-slate-500">Across {analytics.totalUsers} registered employees</div>
        </div>

        <div className="p-5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-1">
          <div className="text-xs text-emerald-300 font-medium">Paid & Approved</div>
          <div className="text-2xl font-extrabold font-mono text-emerald-400">{analytics.totalPaid}</div>
          <div className="text-[11px] text-emerald-400/70">Completed corporate transactions</div>
        </div>

        <div className="p-5 rounded-2xl bg-amber-950/30 border border-amber-500/30 space-y-1">
          <div className="text-xs text-amber-300 font-medium">Pending Approval</div>
          <div className="text-2xl font-extrabold font-mono text-amber-400">{analytics.totalPending}</div>
          <div className="text-[11px] text-amber-400/70">Awaiting manager payment checkout</div>
        </div>

        <div className="p-5 rounded-2xl bg-rose-950/30 border border-rose-500/30 space-y-1">
          <div className="text-xs text-rose-300 font-medium">Cancelled Orders</div>
          <div className="text-2xl font-extrabold font-mono text-rose-400">{analytics.totalCancelled}</div>
          <div className="text-[11px] text-rose-400/70">Revoked orders</div>
        </div>
      </div>

      {/* Regional Operational Breakdown */}
      <div>
        <h3 className="text-base font-bold text-white mb-4">Regional GMV & Volume Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {analytics.regionalMetrics.map((rm) => (
            <div
              key={rm.country}
              className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">{rm.country === "India" ? "🇮🇳" : "🇺🇸"}</span>
                  <h4 className="text-base font-bold text-white">{rm.country} Operations</h4>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {rm.activeRestaurants} Kitchens
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
                  <div className="text-xs text-slate-400">Total Settled GMV</div>
                  <div className="text-lg font-bold font-mono text-indigo-400 mt-1">
                    {rm.currency === "INR" ? `₹${rm.totalGmv.toLocaleString()}` : `$${rm.totalGmv.toFixed(2)}`}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
                  <div className="text-xs text-slate-400">Regional Orders</div>
                  <div className="text-lg font-bold font-mono text-white mt-1">
                    {rm.totalOrders}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
