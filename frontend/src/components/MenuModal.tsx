"use client";

import React, { useState } from "react";
import { Restaurant, MenuItem, CartItem } from "../types";

interface MenuModalProps {
  restaurant: Restaurant | null;
  isOpen: boolean;
  onClose: () => void;
  cart: { [id: string]: CartItem };
  onAddToCart: (item: MenuItem) => void;
  onRemoveFromCart: (itemId: number | string) => void;
  onOpenCart: () => void;
}

export function MenuModal({
  restaurant,
  isOpen,
  onClose,
  cart,
  onAddToCart,
  onRemoveFromCart,
  onOpenCart,
}: MenuModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  if (!isOpen || !restaurant) return null;

  const categories = ["ALL", ...Array.from(new Set(restaurant.menuItems.map((item) => item.category || "Main Course")))];

  const filteredItems = restaurant.menuItems.filter((item) => {
    return selectedCategory === "ALL" || item.category === selectedCategory;
  });

  const getDietaryBadge = (tag: string) => {
    if (tag === "VEG") {
      return (
        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span>VEG</span>
        </span>
      );
    }
    if (tag === "NON_VEG") {
      return (
        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950/80 text-rose-300 border border-rose-500/40">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
          <span>NON-VEG</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-lime-950/80 text-lime-300 border border-lime-500/40">
        <span className="w-1.5 h-1.5 rounded-full bg-lime-400"></span>
        <span>VEGAN</span>
      </span>
    );
  };

  const formatPrice = (price: number, currency: string) => {
    return currency === "INR" ? `₹${price.toFixed(0)}` : `$${price.toFixed(2)}`;
  };

  const totalCartItems = Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header with image banner */}
        <div className="relative h-36 bg-slate-800 flex-shrink-0">
          {restaurant.imageUrl ? (
            <img src={restaurant.imageUrl} alt={restaurant.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-slate-800" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-black/30" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-900/80 text-slate-300 hover:text-white border border-slate-700 hover:bg-slate-800 transition-all z-10"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Restaurant details on banner */}
          <div className="absolute bottom-3 left-5 right-5">
            <div className="flex items-center space-x-2">
              <span className="text-xs px-2 py-0.5 rounded bg-slate-900/90 text-slate-200 border border-slate-700">
                {restaurant.country === "India" ? "🇮🇳 India" : "🇺🇸 USA"}
              </span>
              <span className="text-xs text-emerald-400 font-bold">★ {restaurant.rating.toFixed(1)}</span>
            </div>
            <h2 className="text-xl font-extrabold text-white mt-1">{restaurant.name}</h2>
            <p className="text-xs text-slate-300">{restaurant.cuisine} • {restaurant.deliveryTime}</p>
          </div>
        </div>

        {/* Category Pills */}
        <div className="px-5 py-3 border-b border-slate-800 bg-slate-900/80 flex items-center space-x-2 overflow-x-auto flex-shrink-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Menu Items List */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {filteredItems.map((item) => {
            const qty = cart[item.id]?.quantity || 0;
            return (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-slate-850/60 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center space-x-2">
                    {getDietaryBadge(item.dietaryTag)}
                    <h4 className="text-sm font-bold text-white">{item.name}</h4>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2">{item.description}</p>
                  <div className="text-sm font-extrabold font-mono text-indigo-400 pt-1">
                    {formatPrice(item.price, item.currency)}
                  </div>
                </div>

                {/* Counter / Add Button */}
                <div className="flex-shrink-0 flex items-center justify-end">
                  {qty === 0 ? (
                    <button
                      onClick={() => onAddToCart(item)}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm transition-all flex items-center space-x-1.5 cursor-pointer"
                    >
                      <span>+ Add to Cart</span>
                    </button>
                  ) : (
                    <div className="flex items-center space-x-2 bg-slate-800 border border-slate-700 rounded-xl p-1">
                      <button
                        onClick={() => onRemoveFromCart(item.id)}
                        className="w-7 h-7 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold flex items-center justify-center transition-all cursor-pointer"
                      >
                        -
                      </button>
                      <span className="w-6 text-center text-xs font-mono font-bold text-white">
                        {qty}
                      </span>
                      <button
                        onClick={() => onAddToCart(item)}
                        className="w-7 h-7 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center justify-center transition-all cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Cart Action Sticky Bar */}
        {totalCartItems > 0 && (
          <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between flex-shrink-0">
            <div>
              <span className="text-xs text-slate-400">Cart contains</span>
              <div className="text-sm font-bold text-white">
                {totalCartItems} {totalCartItems === 1 ? "item" : "items"}
              </div>
            </div>
            <button
              onClick={() => {
                onClose();
                onOpenCart();
              }}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center space-x-2 cursor-pointer"
            >
              <span>View Cart & Checkout</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
