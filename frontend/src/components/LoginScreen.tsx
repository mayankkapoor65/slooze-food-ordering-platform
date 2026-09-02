"use client";

import React, { useState } from "react";
import { User, UserRole } from "../types";

export const EMPLOYEE_CREDENTIALS: Record<
  string,
  {
    passcode: string;
    description: string;
  }
> = {
  nick_fury: {
    passcode: "Fury@Admin99",
    description: "Global Admin Master Key",
  },
  captain_marvel: {
    passcode: "Marvel@India77",
    description: "India Manager Access Key",
  },
  captain_america: {
    passcode: "Cap@America88",
    description: "America Manager Access Key",
  },
  thanos: {
    passcode: "Thanos@India01",
    description: "India Member Access Key",
  },
  thor: {
    passcode: "Thor@India02",
    description: "India Member Access Key",
  },
  travis: {
    passcode: "Travis@America03",
    description: "America Member Access Key",
  },
};

interface LoginScreenProps {
  users: User[];
  onLogin: (userId: string) => void;
  loading?: boolean;
}

export function LoginScreen({ users, onLogin, loading }: LoginScreenProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [passcode, setPasscode] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    setPasscode("");
    setError("");
  };

  const handleAutoFill = () => {
    if (selectedUser && EMPLOYEE_CREDENTIALS[selectedUser.id]) {
      setPasscode(EMPLOYEE_CREDENTIALS[selectedUser.id].passcode);
      setError("");
    }
  };

  const handleAuthenticate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) {
      setError("Please select an employee profile to sign in.");
      return;
    }

    const expectedPasscode = EMPLOYEE_CREDENTIALS[selectedUser.id]?.passcode;

    // Strict validation against individual employee password
    if (passcode.trim() === expectedPasscode) {
      onLogin(selectedUser.id);
    } else {
      setError(
        `Incorrect password for ${selectedUser.name}! Please enter "${expectedPasscode}" or click 'Auto-Fill Password'.`
      );
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case "ADMIN":
        return {
          bg: "bg-purple-500/10 border-purple-500/30 text-purple-300",
          label: "👑 ORG ADMIN",
        };
      case "MANAGER":
        return {
          bg: "bg-blue-500/10 border-blue-500/30 text-blue-300",
          label: "🛡️ REGIONAL MANAGER",
        };
      case "MEMBER":
        return {
          bg: "bg-amber-500/10 border-amber-500/30 text-amber-300",
          label: "👤 TEAM MEMBER",
        };
    }
  };

  const getCountryBadge = (country: string) => {
    switch (country) {
      case "India":
        return "🇮🇳 India Division";
      case "America":
        return "🇺🇸 America Division";
      default:
        return "🌐 Global Corporate HQ";
    }
  };

  return (
    <div className="min-h-screen bg-[#06090e] text-slate-100 flex flex-col justify-between relative overflow-hidden">
      {/* Background glow accents */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-indigo-500/20">
              S
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight text-white flex items-center gap-2">
                Slooze Enterprise
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  🔒 RBAC & Re-BAC Protected
                </span>
              </h1>
              <p className="text-xs text-slate-400">Unique Credential Authentication & Access Portal</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center space-x-2 text-xs text-slate-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Security Gateway Live • 6 Individual Passwords</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8 flex-1 flex flex-col items-center justify-center w-full z-10">
        <div className="text-center max-w-xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-slate-300 mb-3">
            <span className="text-indigo-400">🔐</span> Unique Individual Credentials
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Sign In with Employee Credentials
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Each employee has a unique password. Select an employee to inspect their credentials and authenticate.
          </p>
        </div>

        {/* Persona Cards Selection */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 mb-8">
          {users.map((user) => {
            const isSelected = selectedUser?.id === user.id;
            const badge = getRoleBadge(user.role);
            const userCreds = EMPLOYEE_CREDENTIALS[user.id];

            return (
              <div
                key={user.id}
                onClick={() => handleUserClick(user)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                  isSelected
                    ? "bg-indigo-950/60 border-indigo-500 shadow-xl shadow-indigo-900/40 ring-2 ring-indigo-500/80 scale-[1.02]"
                    : "bg-slate-900/80 hover:bg-slate-850 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div>
                  <div className="flex items-start space-x-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-800 overflow-hidden ring-2 ring-slate-700/80 flex-shrink-0">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-slate-300">
                          {user.name[0]}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-white truncate">{user.name}</h3>
                        {isSelected && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500 text-white font-bold">
                            SELECTED
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
                        {getCountryBadge(user.country)}
                      </p>
                      <div className="mt-2">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md border font-semibold ${badge.bg}`}>
                          {badge.label}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Password:</span>
                    <span className="font-mono text-indigo-300 bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-500/20 font-semibold">
                      {userCreds?.passcode || "••••••••"}
                    </span>
                  </div>
                  <p className="text-[10.5px] text-slate-500 line-clamp-1">
                    {userCreds?.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Authentication Form Box */}
        <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
          {selectedUser ? (
            <form onSubmit={handleAuthenticate} className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-300">
                    {selectedUser.name[0]}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{selectedUser.name}</h4>
                    <p className="text-[11px] text-slate-400">{selectedUser.role} • {selectedUser.country}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAutoFill}
                  className="text-[11px] font-medium text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  ⚡ Auto-Fill Password
                </button>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Enter Password for {selectedUser.name}
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder={`Enter ${EMPLOYEE_CREDENTIALS[selectedUser.id]?.passcode || "password"}`}
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono"
                  autoFocus
                />
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5 px-0.5">
                  <span>Required Key:</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    {EMPLOYEE_CREDENTIALS[selectedUser.id]?.passcode}
                  </span>
                </div>
              </div>

              {error && (
                <div className="p-2.5 rounded-lg bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs font-semibold animate-shake">
                  ⚠️ {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>🔐</span>
                <span>Verify Password & Enter Portal</span>
              </button>
            </form>
          ) : (
            <div className="text-center py-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-slate-800 flex items-center justify-center text-slate-400 mb-2">
                👆
              </div>
              <h4 className="text-sm font-bold text-white">Select an Account to Log In</h4>
              <p className="text-xs text-slate-400 mt-1">
                Click on any employee card above to view their credentials and enter their password.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-4 bg-slate-950/80 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Slooze Food Ordering Platform • Individual Employee Passwords & RBAC Protection</span>
          <span className="font-mono text-[11px] text-slate-400">FastAPI + Next.js App Router</span>
        </div>
      </footer>
    </div>
  );
}
