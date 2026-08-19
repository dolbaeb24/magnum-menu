"use client";

import { useAppStore } from "@/lib/store";
import { BUDGET_LABELS, FAMILY, type BudgetOption } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Wallet, Infinity } from "lucide-react";

const BUDGET_OPTIONS: BudgetOption[] = [
  "none",
  "45000",
  "75000",
  "105000",
  "150000",
  "210000",
  "custom",
];

export function BudgetStep() {
  const { budget, customBudget, setBudget, setCustomBudget, setStep } =
    useAppStore();

  return (
    <div className="space-y-5 w-full min-w-0">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-orange-100 mb-1">
          <Wallet className="w-7 h-7 text-orange-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Бюджет на неделю</h2>
        <p className="text-sm text-gray-500 px-2">
          Завтраки, обеды и ужины для {FAMILY.size} человек · 21 блюдо
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2.5 w-full">
        {BUDGET_OPTIONS.map((option) => (
          <Card
            key={option}
            selected={budget === option}
            hoverable
            onClick={() => setBudget(option)}
            className="text-center !py-3 !px-2 min-h-[72px] flex flex-col items-center justify-center"
          >
            {option === "none" ? (
              <Infinity className="w-5 h-5 mx-auto mb-1 text-orange-500" />
            ) : option === "custom" ? (
              <span className="text-xl mb-1 block">✏️</span>
            ) : null}
            <span className={`leading-tight ${option !== "none" && option !== "custom" ? "text-base font-bold text-orange-600" : "text-xs text-gray-600"}`}>
              {BUDGET_LABELS[option]}
            </span>
          </Card>
        ))}
      </div>

      {budget === "custom" && (
        <div className="flex items-center gap-2 justify-center">
          <input
            type="number"
            value={customBudget}
            onChange={(e) => setCustomBudget(parseInt(e.target.value) || 0)}
            className="w-full max-w-[200px] px-4 py-3 border-2 border-orange-200 rounded-xl text-center text-lg font-semibold focus:outline-none focus:border-orange-400"
            step={5000}
            min={30000}
          />
          <span className="text-gray-500">₸</span>
        </div>
      )}

      <div className="pt-2">
        <Button size="lg" className="w-full min-h-[48px]" onClick={() => setStep(1)}>
          Далее →
        </Button>
      </div>
    </div>
  );
}
