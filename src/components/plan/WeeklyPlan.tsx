"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { RecipeModal } from "./RecipeModal";
import { SwapModal } from "./SwapModal";
import type { DayMeal } from "@/lib/types";
import { Clock, Flame, RefreshCw, ChevronRight } from "lucide-react";

export function WeeklyPlan() {
  const { mealPlan } = useAppStore();
  const [selectedMeal, setSelectedMeal] = useState<DayMeal | null>(null);
  const [swapDayIndex, setSwapDayIndex] = useState<number | null>(null);

  if (!mealPlan) return null;

  return (
    <>
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          🗓️ Меню на неделю
        </h2>

        <div className="grid gap-3">
          {mealPlan.meals.map((meal) => (
            <Card
              key={meal.dayIndex}
              hoverable
              className="cursor-pointer"
              onClick={() => setSelectedMeal(meal)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-orange-600">
                      {meal.day}
                    </span>
                    {meal.recipe.familyFavorite && (
                      <Badge variant="warning">❤️ Любимое</Badge>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 truncate">
                    {meal.recipe.name}
                  </h3>
                  <p className="text-sm text-gray-500 truncate mt-0.5">
                    {meal.recipe.description}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {meal.recipe.prepTime + meal.recipe.cookTime} мин
                    </span>
                    <span className="flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5" />
                      {meal.recipe.calories} ккал
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSwapDayIndex(meal.dayIndex);
                    }}
                    title="Заменить блюдо"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                  <ChevronRight className="w-5 h-5 text-gray-300" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {selectedMeal && (
        <RecipeModal
          meal={selectedMeal}
          onClose={() => setSelectedMeal(null)}
        />
      )}

      {swapDayIndex !== null && (
        <SwapModal
          dayIndex={swapDayIndex}
          onClose={() => setSwapDayIndex(null)}
        />
      )}
    </>
  );
}
