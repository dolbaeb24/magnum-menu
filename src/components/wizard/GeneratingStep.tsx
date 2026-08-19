"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import type { MealPlan } from "@/lib/types";
import { ChefHat } from "lucide-react";

export function GeneratingStep() {
  const {
    budget,
    customBudget,
    categories,
    diet,
    setMealPlan,
    setIsGenerating,
    setStep,
  } = useAppStore();

  const [status, setStatus] = useState("Подбираем блюда...");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function generate() {
      setIsGenerating(true);
      try {
        setStatus("Ищем рецепты для семьи...");
        await new Promise((r) => setTimeout(r, 800));

        setStatus("Проверяем цены в Magnum Алматы...");
        await new Promise((r) => setTimeout(r, 600));

        const response = await fetch("/api/meals/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            categories,
            diet,
            budget,
            customBudget: budget === "custom" ? customBudget : undefined,
          }),
        });

        if (!response.ok) throw new Error("Ошибка генерации");

        setStatus("Составляем список покупок...");
        const data = await response.json();
        setMealPlan(data.plan as MealPlan);
      } catch (err) {
        setError("Не удалось составить меню. Попробуйте ещё раз.");
        setTimeout(() => setStep(2), 2000);
      } finally {
        setIsGenerating(false);
      }
    }

    generate();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-6">
      <div className="relative">
        <div className="w-24 h-24 rounded-full bg-orange-100 flex items-center justify-center animate-pulse">
          <ChefHat className="w-12 h-12 text-orange-500" />
        </div>
        <div className="absolute inset-0 w-24 h-24 rounded-full border-4 border-orange-300 border-t-orange-500 animate-spin" />
      </div>

      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">
          {error ?? "Готовим меню на неделю"}
        </h2>
        {!error && (
          <p className="text-gray-500 animate-pulse">{status}</p>
        )}
      </div>

      {!error && (
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-full bg-orange-400 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
