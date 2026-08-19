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
    <div className="space-y-5 w-full min-w-0">
      <div className="text-center space-y-1">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-100 mb-1">
          <Sparkles className="w-7 h-7 text-emerald-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Какие блюда?</h2>
        <p className="text-sm text-gray-500">
          До 3 категорий ({categories.length}/3)
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2.5 w-full">
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
              className={`!p-3 min-h-[60px] ${isDisabled ? "opacity-40 cursor-not-allowed" : ""}`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-2xl shrink-0">{info.emoji}</span>
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm">
                    {info.label}
                  </h3>
                  <p className="text-xs text-gray-500">{info.description}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="flex gap-2 pt-2">
        <Button variant="ghost" className="min-h-[48px]" onClick={() => setStep(0)}>
          ← Назад
        </Button>
        <Button size="lg" className="flex-1 min-h-[48px]" onClick={() => setStep(2)}>
          Далее →
        </Button>
      </div>
    </div>
  );
}
