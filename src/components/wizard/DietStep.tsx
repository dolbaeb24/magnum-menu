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
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-2">
          <Salad className="w-8 h-8 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          Диетические предпочтения
        </h2>
        <p className="text-gray-500">
          Есть ли ограничения в питании?
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {ALL_DIETS.map((d) => {
          const info = DIET_LABELS[d];
          return (
            <Card
              key={d}
              selected={diet === d}
              hoverable
              onClick={() => setDiet(d)}
            >
              <h3 className="font-semibold text-gray-900">{info.label}</h3>
              <p className="text-sm text-gray-500 mt-1">{info.description}</p>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="ghost" onClick={() => setStep(1)}>
          ← Назад
        </Button>
        <Button size="lg" variant="secondary" onClick={() => setStep(3)}>
          Составить меню! 🍽️
        </Button>
      </div>
    </div>
  );
}
