"use client";

import React from "react";
import { Restaurant } from "../types";

interface RestaurantCardProps {
  restaurant: Restaurant;
  onSelect: (restaurant: Restaurant) => void;
}

export function RestaurantCard({ restaurant, onSelect }: RestaurantCardProps) {
  const getFlag = (country: string) => {
    return country === "India" ? "🇮🇳 India" : "🇺🇸 USA";
  };

  return (
    <div className="group relative rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-950/20 overflow-hidden flex flex-col justify-between">
      <div>
        {/* Restaurant Hero Image */}
        <div className="relative h-44 w-full bg-slate-800 overflow-hidden">
          {restaurant.imageUrl ? (
            <img
              src={restaurant.imageUrl}
              alt={restaurant.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl">🍽️</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex items-center space-x-2">
            <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-900/90 backdrop-blur-md text-white border border-slate-700 shadow-sm">
              {getFlag(restaurant.country)}
            </span>
          </div>

          <div className="absolute top-3 right-3 flex items-center space-x-1 px-2 py-1 rounded-lg bg-emerald-500/90 text-white text-xs font-bold shadow-md">
            <span>★</span>
            <span>{restaurant.rating.toFixed(1)}</span>
          </div>

          {/* Title overlay */}
          <div className="absolute bottom-3 left-3 right-3">
            <h3 className="text-lg font-bold text-white tracking-tight drop-shadow-sm truncate">
              {restaurant.name}
            </h3>
            <p className="text-xs text-slate-300 truncate">{restaurant.cuisine}</p>
          </div>
        </div>

        {/* Card Body Info */}
        <div className="p-4 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-1.5">
            <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{restaurant.deliveryTime}</span>
          </div>

          <div className="flex items-center space-x-1.5 font-medium text-slate-300">
            <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span>{restaurant.menuItems?.length || 0} Menu Items</span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-4 pt-0">
        <button
          onClick={() => onSelect(restaurant)}
          className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold tracking-wide shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/40 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
        >
          <span>Browse Menu & Order</span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
    </div>
  );
}
