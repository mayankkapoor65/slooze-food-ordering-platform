"use client";

import React, { useState } from "react";
import { User, UserRole } from "../types";
import { EMPLOYEE_CREDENTIALS } from "./LoginScreen";

interface PersonaSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  currentUserId: string;
  onSelectUser: (userId: string) => void;
  onLogout: () => void;
}

export function PersonaSwitcherModal({
  isOpen,
  onClose,
  users,
  currentUserId,
  onSelectUser,
  onLogout,
}: PersonaSwitcherModalProps) {
  const [selectedUserToAuth, setSelectedUserToAuth] = useState<User | null>(null);
  const [passcode, setPasscode] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  if (!isOpen) return null;

  const handleUserClick = (user: User) => {
    if (user.id === currentUserId) {
      onClose();
      return;
    }
    // Require password authentication to switch to another employee
    setSelectedUserToAuth(user);
    setPasscode("");
    setError("");
  };

  const handleAutoFill = () => {
    if (selectedUserToAuth && EMPLOYEE_CREDENTIALS[selectedUserToAuth.id]) {
      setPasscode(EMPLOYEE_CREDENTIALS[selectedUserToAuth.id].passcode);
      setError("");
    }
  };

  const handleConfirmSwitch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserToAuth) return;

    const expectedPasscode = EMPLOYEE_CREDENTIALS[selectedUserToAuth.id]?.passcode;
    if (passcode.trim() === expectedPasscode) {
      onSelectUser(selectedUserToAuth.id);
      setSelectedUserToAuth(null);
      setPasscode("");
      onClose();
    } else {
      setError(`Incorrect password for ${selectedUserToAuth.name}! Required: "${expectedPasscode}"`);
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case "ADMIN":
        return "bg-purple-500/10 border-purple-500/30 text-purple-300";
      case "MANAGER":
        return "bg-blue-500/10 border-blue-500/30 text-blue-300";
      case "MEMBER":
        return "bg-amber-500/10 border-amber-500/30 text-amber-300";
    }
  };

  const getCountryBadge = (country: string) => {
    switch (country) {
      case "India":
        return "🇮🇳 India";
      case "America":
        return "🇺🇸 America";
      default:
        return "🌐 Global";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <span>🔐 Switch Account (Re-Authentication Required)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              To switch between employee accounts on this device, you must authenticate with the target user&apos;s password.
            </p>
          </div>
          <button
            onClick={() => {
              setSelectedUserToAuth(null);
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
          {/* If a user is selected to switch to, show password prompt */}
          {selectedUserToAuth ? (
            <div className="bg-slate-950 border border-indigo-500/50 rounded-2xl p-5 shadow-xl animate-scale-up">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 overflow-hidden ring-2 ring-indigo-500">
                    {selectedUserToAuth.avatarUrl ? (
                      <img src={selectedUserToAuth.avatarUrl} alt={selectedUserToAuth.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-slate-300">
                        {selectedUserToAuth.name[0]}
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>Switch to {selectedUserToAuth.name}</span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border uppercase font-bold ${getRoleColor(selectedUserToAuth.role)}`}>
                        {selectedUserToAuth.role}
                      </span>
                    </h4>
                    <p className="text-xs text-slate-400">{getCountryBadge(selectedUserToAuth.country)} Division</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedUserToAuth(null)}
                  className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded-lg hover:bg-slate-800"
                >
                  Cancel
                </button>
              </div>

              <form onSubmit={handleConfirmSwitch} className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">
                    Enter Password for {selectedUserToAuth.name}:
                  </label>
                  <button
                    type="button"
                    onClick={handleAutoFill}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/30"
                  >
                    ⚡ Auto-Fill
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder={`Enter ${EMPLOYEE_CREDENTIALS[selectedUserToAuth.id]?.passcode || "password"}`}
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-white"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>Required Key:</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    {EMPLOYEE_CREDENTIALS[selectedUserToAuth.id]?.passcode}
                  </span>
                </div>

                {error && (
                  <div className="p-2.5 rounded-lg bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs font-semibold">
                    ⚠️ {error}
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedUserToAuth(null)}
                    className="w-1/2 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold"
                  >
                    Back to List
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-1.5"
                  >
                    <span>🔐</span>
                    <span>Authenticate & Switch</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {users.map((user) => {
                const isCurrent = user.id === currentUserId;
                const userCreds = EMPLOYEE_CREDENTIALS[user.id];

                return (
                  <div
                    key={user.id}
                    onClick={() => handleUserClick(user)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isCurrent
                        ? "bg-indigo-950/40 border-indigo-500 shadow-md shadow-indigo-900/30 ring-1 ring-indigo-500 cursor-default"
                        : "bg-slate-850 hover:bg-slate-800 border-slate-750 hover:border-indigo-500/60"
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-11 h-11 rounded-full bg-slate-700 overflow-hidden ring-2 ring-slate-600 flex-shrink-0">
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
                          <h4 className="text-sm font-bold text-white truncate">{user.name}</h4>
                          {isCurrent && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500 text-white font-semibold">
                              CURRENT
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border uppercase font-bold ${getRoleColor(user.role)}`}>
                            {user.role}
                          </span>
                          <span className="text-xs text-slate-300 font-medium">
                            {getCountryBadge(user.country)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Password:</span>
                      <span className="font-mono text-indigo-300 bg-indigo-950/40 px-1.5 py-0.5 rounded border border-indigo-500/20">
                        {userCreds?.passcode || "••••••••"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              onLogout();
            }}
            className="px-3.5 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>🚪</span>
            <span>Log Out Completely</span>
          </button>

          <span className="text-xs text-slate-400">
            Session Security: <strong className="text-slate-200">Strict Password Isolation</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
