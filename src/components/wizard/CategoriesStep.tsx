"use client";

import { useAppStore } from "@/lib/store";
import { CATEGORY_LABELS, type MealCategory } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Sparkles } from "lucide-react";

const ALL_CATEGORIES = Object.keys(CATEGORY_LABELS) as MealCategory[];

export function CategoriesStep() {
  const { categories, toggleCategory, setStep } = useAppStore();

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-2">
          <Sparkles className="w-8 h-8 text-emerald-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          Какие блюда хотите?
        </h2>
        <p className="text-gray-500">
          Выберите до 3 категорий ({categories.length}/3)
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {ALL_CATEGORIES.map((cat) => {
          const info = CATEGORY_LABELS[cat];
          const isSelected = categories.includes(cat);
          const isDisabled = !isSelected && categories.length >= 3;

          return (
            <Card
              key={cat}
              selected={isSelected}
              hoverable={!isDisabled}
              onClick={() => !isDisabled && toggleCategory(cat)}
              className={isDisabled ? "opacity-40 cursor-not-allowed" : ""}
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{info.emoji}</span>
                <div>
                  <h3 className="font-semibold text-gray-900">{info.label}</h3>
                  <p className="text-sm text-gray-500">{info.description}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="ghost" onClick={() => setStep(0)}>
          ← Назад
        </Button>
        <Button size="lg" onClick={() => setStep(2)}>
          Далее →
        </Button>
      </div>
    </div>
  );
}
