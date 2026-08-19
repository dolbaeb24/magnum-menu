"use client";

import { useAppStore } from "@/lib/store";
import { WeeklyPlan } from "@/components/plan/WeeklyPlan";
import { ShoppingList } from "@/components/plan/ShoppingList";
import { Button } from "@/components/ui/Button";
import { FAMILY } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { RotateCcw, ShoppingBag } from "lucide-react";
import { useState } from "react";

export function MealPlanView() {
  const { mealPlan, resetWizard } = useAppStore();
  const [activeTab, setActiveTab] = useState<"meals" | "shopping">("meals");

  if (!mealPlan) return null;

  const uncheckedCost = mealPlan.shoppingList
    .filter((i) => !i.checked)
    .reduce((sum, item) => sum + item.price, 0);

  const daysCount = new Set(mealPlan.meals.map((m) => m.dayIndex)).size;

  return (
    <div className="space-y-4 w-full min-w-0">
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-4 text-white w-full min-w-0">
        <h1 className="text-xl font-bold mb-0.5">
          Привет, {FAMILY.mom}! 👋
        </h1>
        <p className="text-orange-100 text-xs">
          {daysCount} дней · 3 приёма пищи · {FAMILY.size} человек
        </p>
        <div className="flex gap-2 mt-3">
          <div className="flex-1 bg-white/20 rounded-xl px-3 py-2 min-w-0">
            <p className="text-[10px] text-orange-100 uppercase tracking-wide">
              К покупке
            </p>
            <p className="text-lg font-bold truncate">
              {formatPrice(uncheckedCost)}
            </p>
          </div>
          <div className="flex-1 bg-white/20 rounded-xl px-3 py-2 min-w-0">
            <p className="text-[10px] text-orange-100 uppercase tracking-wide">
              Блюд
            </p>
            <p className="text-lg font-bold">{mealPlan.meals.length}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-1.5 bg-gray-100 rounded-xl p-1">
        <button
          onClick={() => setActiveTab("meals")}
          className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all min-h-[44px] ${
            activeTab === "meals"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500"
          }`}
        >
          🍽️ Меню
        </button>
        <button
          onClick={() => setActiveTab("shopping")}
          className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all min-h-[44px] ${
            activeTab === "shopping"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500"
          }`}
        >
          🛒 Покупки
        </button>
      </div>

      {activeTab === "meals" ? <WeeklyPlan /> : <ShoppingList />}

      <div className="flex justify-center pt-2 pb-4">
        <Button variant="ghost" onClick={resetWizard} className="min-h-[44px]">
          <RotateCcw className="w-4 h-4 mr-2" />
          Новое меню
        </Button>
      </div>
    </div>
  );
}
