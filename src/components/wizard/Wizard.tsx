"use client";

import { useAppStore } from "@/lib/store";
import { BudgetStep } from "./BudgetStep";
import { CategoriesStep } from "./CategoriesStep";
import { GeneratingStep } from "./GeneratingStep";

const STEPS = [
  { component: BudgetStep, label: "Бюджет" },
  { component: CategoriesStep, label: "Категории" },
  { component: GeneratingStep, label: "Готовим" },
];

export function Wizard() {
  const { step } = useAppStore();
  const CurrentStep = STEPS[step]?.component ?? BudgetStep;

  return (
    <div className="space-y-6">
      {step < 2 && (
        <div className="flex items-center justify-center gap-2">
          {STEPS.slice(0, 2).map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  i <= step
                    ? "bg-orange-500 text-white"
                    : "bg-gray-200 text-gray-400"
                }`}
              >
                {i + 1}
              </div>
              {i < 1 && (
                <div
                  className={`w-8 h-0.5 ${
                    i < step ? "bg-orange-500" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      )}

      <CurrentStep />
    </div>
  );
}
