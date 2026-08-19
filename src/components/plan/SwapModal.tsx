"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import type { Recipe, MealPlan } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Clock, X, Loader2 } from "lucide-react";

interface SwapModalProps {
  dayIndex: number;
  onClose: () => void;
}

export function SwapModal({ dayIndex, onClose }: SwapModalProps) {
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
          body: JSON.stringify({ plan: mealPlan, dayIndex }),
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
  }, [dayIndex, mealPlan]);

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

  const currentDay = mealPlan?.meals[dayIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[70vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Заменить блюдо</p>
            <h2 className="text-lg font-bold text-gray-900">
              {currentDay?.day}: {currentDay?.recipe.name}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="px-6 py-4 space-y-3">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
            </div>
          ) : alternatives.length === 0 ? (
            <p className="text-center text-gray-500 py-10">
              Нет альтернативных блюд
            </p>
          ) : (
            alternatives.map((recipe) => (
              <Card
                key={recipe.id}
                hoverable
                className="cursor-pointer"
                onClick={() => handleSwap(recipe.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{recipe.name}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">{recipe.description}</p>
                    <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      {recipe.prepTime + recipe.cookTime} мин
                    </div>
                  </div>
                  {swapping === recipe.id && (
                    <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />
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
