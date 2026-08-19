"use client";

import type { DayMeal } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Clock, Flame, X, Users } from "lucide-react";

interface RecipeModalProps {
  meal: DayMeal;
  onClose: () => void;
}

export function RecipeModal({ meal, onClose }: RecipeModalProps) {
  const { recipe } = meal;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-3xl">
          <div>
            <p className="text-sm text-orange-600 font-medium">{meal.day}</p>
            <h2 className="text-xl font-bold text-gray-900">{recipe.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="px-6 py-4 space-y-6">
          <p className="text-gray-600">{recipe.description}</p>

          <div className="flex flex-wrap gap-2">
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
            <h3 className="font-semibold text-gray-900 mb-3">
              🛒 Ингредиенты
            </h3>
            <ul className="space-y-2">
              {recipe.ingredients.map((ing, i) => (
                <li
                  key={i}
                  className="flex justify-between text-sm py-1.5 border-b border-gray-50"
                >
                  <span className="text-gray-700">{ing.name}</span>
                  <span className="text-gray-400 font-medium">{ing.amount}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">
              👩‍🍳 Приготовление
            </h3>
            <ol className="space-y-3">
              {recipe.steps.map((step, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </span>
                  <span className="text-gray-700 pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4">
          <Button className="w-full" onClick={onClose}>
            Понятно!
          </Button>
        </div>
      </div>
    </div>
  );
}
