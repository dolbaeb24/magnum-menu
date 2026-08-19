"use client";

import { useAppStore } from "@/lib/store";
import { BUDGET_LABELS, FAMILY, type BudgetOption } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import { Wallet, Infinity } from "lucide-react";

const BUDGET_OPTIONS: BudgetOption[] = [
  "none",
  "15000",
  "25000",
  "35000",
  "50000",
  "70000",
  "custom",
];

export function BudgetStep() {
  const { budget, customBudget, setBudget, setCustomBudget, setStep } =
    useAppStore();

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 mb-2">
          <Wallet className="w-8 h-8 text-orange-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          Бюджет на неделю
        </h2>
        <p className="text-gray-500">
          Сколько готовы потратить на продукты для {FAMILY.size} человек?
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {BUDGET_OPTIONS.map((option) => (
          <Card
            key={option}
            selected={budget === option}
            hoverable
            onClick={() => setBudget(option)}
            className="text-center py-4"
          >
            {option === "none" ? (
              <Infinity className="w-6 h-6 mx-auto mb-2 text-orange-500" />
            ) : option === "custom" ? (
              <span className="text-2xl mb-2 block">✏️</span>
            ) : (
              <span className="text-lg font-bold text-orange-600 block mb-1">
                {formatPrice(parseInt(option))}
              </span>
            )}
            <span className="text-sm text-gray-600">
              {BUDGET_LABELS[option]}
            </span>
          </Card>
        ))}
      </div>

      {budget === "custom" && (
        <div className="flex items-center gap-3 justify-center">
          <input
            type="number"
            value={customBudget}
            onChange={(e) => setCustomBudget(parseInt(e.target.value) || 0)}
            className="w-40 px-4 py-2 border-2 border-orange-200 rounded-xl text-center text-lg font-semibold focus:outline-none focus:border-orange-400"
            step={1000}
            min={5000}
          />
          <span className="text-gray-500">₸</span>
        </div>
      )}

      <div className="flex justify-end pt-4">
        <Button size="lg" onClick={() => setStep(1)}>
          Далее →
        </Button>
      </div>
    </div>
  );
}
