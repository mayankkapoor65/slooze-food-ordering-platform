"use client";

import React from "react";
import { User, UserRole } from "../types";

interface NavbarProps {
  currentUser: User | null;
  activeTab: "restaurants" | "orders" | "payments" | "analytics";
  setActiveTab: (tab: "restaurants" | "orders" | "payments" | "analytics") => void;
  cartCount: number;
  onOpenCart: () => void;
  onOpenPersonaModal: () => void;
  onLogout: () => void;
}

export function Navbar({
  currentUser,
  activeTab,
  setActiveTab,
  cartCount,
  onOpenCart,
  onOpenPersonaModal,
  onLogout,
}: NavbarProps) {
  const getRoleBadge = (role?: UserRole) => {
    switch (role) {
      case "ADMIN":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30";
      case "MANAGER":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "MEMBER":
        return "bg-amber-500/20 text-amber-300 border-amber-500/30";
      default:
        return "bg-slate-500/20 text-slate-300 border-slate-500/30";
    }
  };

  const getCountryFlag = (country?: string) => {
    if (country === "India") return "🇮🇳 India";
    if (country === "America") return "🇺🇸 USA";
    return "🌐 Global";
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 glass-panel shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => setActiveTab("restaurants")}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                Slooze
              </span>
              <span className="text-[10px] ml-1.5 px-1.5 py-0.5 rounded font-mono font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                RBAC & Re-BAC
              </span>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => setActiveTab("restaurants")}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === "restaurants"
                  ? "bg-slate-800 text-white shadow-inner border border-slate-700"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              🍽️ Restaurants
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === "orders"
                  ? "bg-slate-800 text-white shadow-inner border border-slate-700"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              📋 Orders Ledger
            </button>
            <button
              onClick={() => setActiveTab("payments")}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === "payments"
                  ? "bg-slate-800 text-white shadow-inner border border-slate-700"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              💳 Payment Channels
            </button>
            {currentUser?.role === "ADMIN" && (
              <button
                onClick={() => setActiveTab("analytics")}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === "analytics"
                    ? "bg-purple-900/40 text-purple-200 shadow-inner border border-purple-700/50"
                    : "text-purple-400 hover:text-purple-200 hover:bg-purple-950/40"
                }`}
              >
                📊 Admin Stats
              </button>
            )}
          </nav>
        </div>

        {/* Right side controls */}
        <div className="flex items-center space-x-3">
          {/* Cart Button */}
          <button
            onClick={onOpenCart}
            className="relative p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 transition-all flex items-center space-x-2"
            title="Open Cart"
          >
            <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {cartCount > 0 && (
              <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold font-mono text-white bg-indigo-600 rounded-full animate-pulse">
                {cartCount}
              </span>
            )}
          </button>

          {/* Active Persona Pill & Switcher Trigger */}
          {currentUser ? (
            <div className="flex items-center space-x-2">
              <button
                onClick={onOpenPersonaModal}
                className="flex items-center space-x-2.5 pl-2 pr-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-750 border border-slate-700 transition-all text-left group"
              >
                <div className="w-7 h-7 rounded-full bg-slate-700 overflow-hidden ring-1 ring-slate-600">
                  {currentUser.avatarUrl ? (
                    <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-300">
                      {currentUser.name[0]}
                    </div>
                  )}
                </div>
                <div className="hidden sm:block">
                  <div className="text-xs font-semibold text-slate-200 group-hover:text-white flex items-center space-x-1.5">
                    <span>{currentUser.name}</span>
                    <span className="text-[10px] text-slate-400">({getCountryFlag(currentUser.country)})</span>
                  </div>
                  <div className="flex items-center space-x-1 mt-0.5">
                    <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border uppercase font-bold ${getRoleBadge(currentUser.role)}`}>
                      {currentUser.role}
                    </span>
                  </div>
                </div>
                <svg className="w-4 h-4 text-slate-400 group-hover:text-slate-200 transition-transform group-hover:translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <button
                onClick={onLogout}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all"
                title="Switch / Log out"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenPersonaModal}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-md shadow-indigo-600/30 transition-all"
            >
              Select Persona
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
