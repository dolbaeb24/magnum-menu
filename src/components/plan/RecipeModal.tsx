"use client";

import type { DayMeal } from "@/lib/types";
import { MEAL_TYPE_LABELS } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Clock, Flame, X, Users } from "lucide-react";

interface RecipeModalProps {
  meal: DayMeal;
  onClose: () => void;
}

export function RecipeModal({ meal, onClose }: RecipeModalProps) {
  const { recipe } = meal;
  const typeInfo = MEAL_TYPE_LABELS[meal.mealType];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-t-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl safe-bottom">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-orange-600 font-medium">
              {typeInfo.emoji} {meal.day} · {typeInfo.label}
            </p>
            <h2 className="text-lg font-bold text-gray-900 break-words leading-snug">
              {recipe.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-full hover:bg-gray-100 shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="px-4 py-4 space-y-5">
          <p className="text-sm text-gray-600">{recipe.description}</p>

          <div className="flex flex-wrap gap-1.5">
            <Badge variant="info">
              <Clock className="w-3 h-3 mr-1" />
              {recipe.prepTime + recipe.cookTime} мин
            </Badge>
            <Badge variant="warning">
              <Flame className="w-3 h-3 mr-1" />
              {recipe.calories} ккал
            </Badge>
            <Badge variant="success">
              <Users className="w-3 h-3 mr-1" />
              {recipe.servings} порций
            </Badge>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2 text-sm">
              🛒 Ингредиенты
            </h3>
            <ul className="space-y-1.5">
              {recipe.ingredients.map((ing, i) => (
                <li
                  key={i}
                  className="flex justify-between gap-2 text-sm py-1 border-b border-gray-50"
                >
                  <span className="text-gray-700 break-words">{ing.name}</span>
                  <span className="text-gray-400 font-medium shrink-0">
                    {ing.amount}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2 text-sm">
              👩‍🍳 Приготовление
            </h3>
            <ol className="space-y-2.5">
              {recipe.steps.map((step, i) => (
                <li key={i} className="flex gap-2.5 text-sm">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </span>
                  <span className="text-gray-700 pt-0.5 break-words">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-4 py-3 safe-bottom">
          <Button className="w-full min-h-[48px]" onClick={onClose}>
            Понятно!
          </Button>
        </div>
      </div>
    </div>
  );
}
