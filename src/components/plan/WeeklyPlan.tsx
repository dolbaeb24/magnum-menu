"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { RecipeModal } from "./RecipeModal";
import { SwapModal } from "./SwapModal";
import type { DayMeal, MealType } from "@/lib/types";
import { MEAL_TYPE_LABELS, DAYS_OF_WEEK } from "@/lib/types";
import { Clock, Flame, RefreshCw, ChevronRight } from "lucide-react";

export function WeeklyPlan() {
  const { mealPlan } = useAppStore();
  const [selectedMeal, setSelectedMeal] = useState<DayMeal | null>(null);
  const [swapTarget, setSwapTarget] = useState<{
    dayIndex: number;
    mealType: MealType;
  } | null>(null);

  if (!mealPlan) return null;

  const mealsByDay = DAYS_OF_WEEK.map((day, dayIndex) => ({
    day,
    dayIndex,
    meals: mealPlan.meals.filter((m) => m.dayIndex === dayIndex),
  }));

  return (
    <>
      <div className="space-y-4 w-full min-w-0">
        <h2 className="text-lg font-bold text-gray-900">🗓️ Меню на неделю</h2>
        <p className="text-sm text-gray-500 -mt-2">
          Завтрак, обед и ужин на каждый день
        </p>

        <div className="space-y-4 w-full min-w-0">
          {mealsByDay.map(({ day, dayIndex, meals }) => (
            <div key={dayIndex} className="w-full min-w-0">
              <h3 className="text-sm font-semibold text-orange-600 mb-2 px-1 flex items-center gap-2">
                {day}
                {(mealPlan.specialDays ?? []).includes(dayIndex) &&
                  mealPlan.categories.includes("indulge") && (
                    <span className="text-[10px] font-semibold bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full">
                      🍕 особый день
                    </span>
                  )}
              </h3>
              <div className="space-y-2 w-full min-w-0">
                {meals.map((meal) => {
                  const typeInfo = MEAL_TYPE_LABELS[meal.mealType];
                  return (
                    <Card
                      key={`${dayIndex}-${meal.mealType}`}
                      hoverable
                      className="cursor-pointer !p-3 w-full min-w-0 overflow-hidden"
                      onClick={() => setSelectedMeal(meal)}
                    >
                      <div className="flex items-start gap-2 w-full min-w-0">
                        <span className="text-lg shrink-0 mt-0.5">
                          {typeInfo.emoji}
                        </span>
                        <div className="flex-1 min-w-0 overflow-hidden">
                          <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                            <span className="text-xs font-medium text-gray-500">
                              {typeInfo.label}
                            </span>
                            {meal.recipe.familyFavorite && (
                              <Badge variant="warning" className="!text-[10px] !px-1.5">
                                ❤️
                              </Badge>
                            )}
                          </div>
                          <h4 className="font-semibold text-gray-900 text-sm leading-snug break-words">
                            {meal.recipe.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-400">
                            <span className="flex items-center gap-0.5 shrink-0">
                              <Clock className="w-3 h-3" />
                              {meal.recipe.prepTime + meal.recipe.cookTime} мин
                            </span>
                            <span className="flex items-center gap-0.5 shrink-0">
                              <Flame className="w-3 h-3" />
                              {meal.recipe.calories} ккал
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-center gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="!p-2 min-w-[44px] min-h-[44px]"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSwapTarget({
                                dayIndex,
                                mealType: meal.mealType,
                              });
                            }}
                            title="Заменить блюдо"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                          <ChevronRight className="w-4 h-4 text-gray-300" />
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedMeal && (
        <RecipeModal meal={selectedMeal} onClose={() => setSelectedMeal(null)} />
      )}

      {swapTarget && (
        <SwapModal
          dayIndex={swapTarget.dayIndex}
          mealType={swapTarget.mealType}
          onClose={() => setSwapTarget(null)}
        />
      )}
    </>
  );
}
