"use client";

import React, { useState } from "react";
import { Restaurant } from "../types";
import { RestaurantCard } from "./RestaurantCard";

interface RestaurantGridProps {
  restaurants: Restaurant[];
  loading: boolean;
  onSelectRestaurant: (restaurant: Restaurant) => void;
  userCountry: string;
}

export function RestaurantGrid({
  restaurants,
  loading,
  onSelectRestaurant,
  userCountry,
}: RestaurantGridProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState<string>("ALL");

  // Extract unique cuisines
  const cuisines = ["ALL", ...Array.from(new Set(restaurants.map((r) => r.cuisine.split("&")[0].trim())))];

  // Filter restaurants
  const filtered = restaurants.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.cuisine.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCuisine =
      selectedCuisine === "ALL" || r.cuisine.toLowerCase().includes(selectedCuisine.toLowerCase());
    return matchesSearch && matchesCuisine;
  });

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <span>Explore Partner Kitchens</span>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {filtered.length} available
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {userCountry === "Global"
              ? "Displaying all regional kitchens org-wide."
              : `Showing kitchens isolated to ${userCountry} based on Re-BAC rules.`}
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search restaurants or cuisines..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
          />
          <svg
            className="w-4 h-4 text-slate-500 absolute left-3 top-2.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-2 text-xs text-slate-500 hover:text-slate-300"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Cuisine Quick Filters */}
      {cuisines.length > 2 && (
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
          {cuisines.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCuisine(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCuisine === c
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800"
              }`}
            >
              {c === "ALL" ? "All Cuisines" : c}
            </button>
          ))}
        </div>
      )}

      {/* Grid or Empty/Loading State */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-64 rounded-2xl bg-slate-900 border border-slate-800" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center rounded-2xl bg-slate-900/50 border border-slate-800">
          <div className="text-4xl">🔍</div>
          <h3 className="text-sm font-bold text-slate-200 mt-3">No restaurants found</h3>
          <p className="text-xs text-slate-400 mt-1">
            Try adjusting your search criteria or switch to another regional persona.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((restaurant) => (
            <RestaurantCard
              key={restaurant.id}
              restaurant={restaurant}
              onSelect={onSelectRestaurant}
            />
          ))}
        </div>
      )}
    </div>
  );
}
