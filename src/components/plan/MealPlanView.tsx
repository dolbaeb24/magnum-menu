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

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-1">
          Привет, {FAMILY.mom}! 👋
        </h1>
        <p className="text-orange-100 text-sm">
          Меню на неделю для {FAMILY.size} человек готово
        </p>
        <div className="flex items-center gap-4 mt-4">
          <div className="bg-white/20 rounded-xl px-4 py-2">
            <p className="text-xs text-orange-100">К покупке</p>
            <p className="text-xl font-bold">{formatPrice(uncheckedCost)}</p>
          </div>
          <div className="bg-white/20 rounded-xl px-4 py-2">
            <p className="text-xs text-orange-100">Блюд</p>
            <p className="text-xl font-bold">{mealPlan.meals.length}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 bg-gray-100 rounded-xl p-1">
        <button
          onClick={() => setActiveTab("meals")}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === "meals"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500"
          }`}
        >
          🍽️ Меню
        </button>
        <button
          onClick={() => setActiveTab("shopping")}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === "shopping"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500"
          }`}
        >
          <ShoppingBag className="w-4 h-4 inline mr-1" />
          Покупки
        </button>
      </div>

      {activeTab === "meals" ? <WeeklyPlan /> : <ShoppingList />}

      <div className="flex justify-center pt-4">
        <Button variant="ghost" onClick={resetWizard}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Составить новое меню
        </Button>
      </div>
    </div>
  );
}
