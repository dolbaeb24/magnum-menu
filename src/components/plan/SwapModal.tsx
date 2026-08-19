"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import type { Recipe, MealPlan, MealType } from "@/lib/types";
import { MEAL_TYPE_LABELS } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Clock, X, Loader2 } from "lucide-react";

interface SwapModalProps {
  dayIndex: number;
  mealType: MealType;
  onClose: () => void;
}

export function SwapModal({ dayIndex, mealType, onClose }: SwapModalProps) {
  const { mealPlan, setMealPlan } = useAppStore();
  const [alternatives, setAlternatives] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [swapping, setSwapping] = useState<string | null>(null);

  useEffect(() => {
    async function loadAlternatives() {
      if (!mealPlan) return;
      try {
        const response = await fetch("/api/meals/swap", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan: mealPlan, dayIndex, mealType }),
        });
        const data = await response.json();
        setAlternatives(data.alternatives ?? []);
      } catch {
        setAlternatives([]);
      } finally {
        setLoading(false);
      }
    }
    loadAlternatives();
  }, [dayIndex, mealType, mealPlan]);

  async function handleSwap(recipeId: string) {
    if (!mealPlan) return;
    setSwapping(recipeId);
    try {
      const response = await fetch("/api/meals/swap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: mealPlan,
          dayIndex,
          mealType,
          newRecipeId: recipeId,
        }),
      });
      const data = await response.json();
      setMealPlan(data.plan as MealPlan);
      onClose();
    } catch {
      // ignore
    } finally {
      setSwapping(null);
    }
  }

  const currentMeal = mealPlan?.meals.find(
    (m) => m.dayIndex === dayIndex && m.mealType === mealType
  );
  const typeLabel = MEAL_TYPE_LABELS[mealType];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-t-3xl w-full max-w-lg max-h-[80vh] overflow-y-auto shadow-2xl safe-bottom">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-gray-500">
              {typeLabel.emoji} {typeLabel.label} · {currentMeal?.day}
            </p>
            <h2 className="text-base font-bold text-gray-900 break-words leading-snug">
              {currentMeal?.recipe.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-full hover:bg-gray-100 shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="px-4 py-3 space-y-2 pb-6">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
            </div>
          ) : alternatives.length === 0 ? (
            <p className="text-center text-gray-500 py-10 text-sm">
              Нет альтернативных блюд
            </p>
          ) : (
            alternatives.map((recipe) => (
              <Card
                key={recipe.id}
                hoverable
                className="cursor-pointer !p-3"
                onClick={() => handleSwap(recipe.id)}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm break-words">
                      {recipe.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                      {recipe.description}
                    </p>
                    <div className="flex items-center gap-1 mt-1 text-[11px] text-gray-400">
                      <Clock className="w-3 h-3" />
                      {recipe.prepTime + recipe.cookTime} мин
                    </div>
                  </div>
                  {swapping === recipe.id && (
                    <Loader2 className="w-5 h-5 text-orange-500 animate-spin shrink-0" />
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
