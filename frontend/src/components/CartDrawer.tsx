"use client";

import React from "react";
import { CartItem, User, MenuItem } from "../types";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: { [id: string]: CartItem };
  onAddToCart: (item: MenuItem) => void;
  onRemoveFromCart: (itemId: number | string) => void;
  onClearCart: () => void;
  onCheckout: () => void;
  currentUser: User | null;
  loading: boolean;
}

export function CartDrawer({
  isOpen,
  onClose,
  cart,
  onAddToCart,
  onRemoveFromCart,
  onClearCart,
  onCheckout,
  currentUser,
  loading,
}: CartDrawerProps) {
  if (!isOpen) return null;

  const items = Object.values(cart);
  const totalItemsCount = items.reduce((sum, i) => sum + i.quantity, 0);

  const subtotal = items.reduce((sum, i) => sum + i.item.price * i.quantity, 0);
  const currency = items.length > 0 ? items[0].item.currency : "USD";

  const formatPrice = (amount: number, curr: string) => {
    return curr === "INR" ? `₹${amount.toFixed(0)}` : `$${amount.toFixed(2)}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col justify-between">
          {/* Drawer Header */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-white">Order Cart ({totalItemsCount})</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Cart Items List */}
          <div className="p-6 flex-1 overflow-y-auto space-y-4">
            {items.length === 0 ? (
              <div className="py-20 text-center">
                <div className="text-4xl mb-3">🛒</div>
                <h4 className="text-sm font-bold text-slate-200">Your cart is empty</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Browse regional kitchens and add delicious meals to place an order.
                </p>
              </div>
            ) : (
              items.map(({ item, quantity }) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-slate-850/80 border border-slate-800 flex items-center justify-between gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs font-bold text-white truncate">{item.name}</h5>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">
                      {formatPrice(item.price, item.currency)} each
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 bg-slate-800 border border-slate-700 rounded-lg p-1">
                    <button
                      onClick={() => onRemoveFromCart(item.id)}
                      className="w-6 h-6 rounded bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold flex items-center justify-center transition-all cursor-pointer"
                    >
                      -
                    </button>
                    <span className="w-5 text-center text-xs font-mono font-bold text-white">
                      {quantity}
                    </span>
                    <button
                      onClick={() => onAddToCart(item)}
                      className="w-6 h-6 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center transition-all cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-right font-mono font-bold text-xs text-indigo-300 w-16">
                    {formatPrice(item.price * quantity, item.currency)}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Bottom Billing & Checkout Footer */}
          {items.length > 0 && (
            <div className="p-6 bg-slate-950 border-t border-slate-800 space-y-4">
              {/* Cost Breakdown */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span className="font-mono text-slate-200">{formatPrice(subtotal, currency)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Corporate Billing</span>
                  <span className="text-emerald-400 font-medium">Included</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white border-t border-slate-800/80 pt-2">
                  <span>Total Amount</span>
                  <span className="font-mono text-indigo-400 text-base">{formatPrice(subtotal, currency)}</span>
                </div>
              </div>

              {/* Persona Access Notice */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
                {currentUser?.role === "MEMBER" ? (
                  <p className="flex items-start space-x-1.5">
                    <span>ℹ️</span>
                    <span>
                      As a <strong>Member ({currentUser.name})</strong>, submitting this cart creates an order in{" "}
                      <strong className="text-amber-400">PENDING_PAYMENT</strong> status for Manager review.
                    </span>
                  </p>
                ) : (
                  <p className="flex items-start space-x-1.5">
                    <span>⚡</span>
                    <span>
                      As a <strong>{currentUser?.role}</strong>, you can approve and pay for this order immediately upon submission.
                    </span>
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={onClearCart}
                  disabled={loading}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-bold border border-slate-800 transition-all"
                >
                  Clear
                </button>
                <button
                  onClick={onCheckout}
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900/50 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  {loading ? (
                    <span>Submitting Order...</span>
                  ) : (
                    <>
                      <span>Place Order ({formatPrice(subtotal, currency)})</span>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
