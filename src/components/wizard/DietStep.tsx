"use client";

import { useAppStore } from "@/lib/store";
import { DIET_LABELS, type DietType } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Salad } from "lucide-react";

const ALL_DIETS = Object.keys(DIET_LABELS) as DietType[];

export function DietStep() {
  const { diet, setDiet, setStep } = useAppStore();

  return (
    <div className="space-y-5 w-full min-w-0">
      <div className="text-center space-y-1">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-100 mb-1">
          <Salad className="w-7 h-7 text-green-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Диета</h2>
        <p className="text-sm text-gray-500">Есть ограничения?</p>
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        {ALL_DIETS.map((d) => {
          const info = DIET_LABELS[d];
          return (
            <Card
              key={d}
              selected={diet === d}
              hoverable
              onClick={() => setDiet(d)}
              className="!p-3 min-h-[56px]"
            >
              <h3 className="font-semibold text-gray-900 text-sm">{info.label}</h3>
              <p className="text-xs text-gray-500 mt-0.5">{info.description}</p>
            </Card>
          );
        })}
      </div>

      <div className="flex gap-2 pt-2">
        <Button variant="ghost" className="min-h-[48px]" onClick={() => setStep(1)}>
          ← Назад
        </Button>
        <Button
          size="lg"
          variant="secondary"
          className="flex-1 min-h-[48px]"
          onClick={() => setStep(3)}
        >
          Составить меню! 🍽️
        </Button>
      </div>
    </div>
  );
}
