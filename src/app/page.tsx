"use client";

import { useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { Wizard } from "@/components/wizard/Wizard";
import { MealPlanView } from "@/components/plan/MealPlanView";
import { FAMILY } from "@/lib/types";

export default function Home() {
  const { view, mealPlan, setView } = useAppStore();

  useEffect(() => {
    if (mealPlan && view === "wizard") {
      setView("plan");
    }
  }, [mealPlan, view, setView]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-amber-50">
      <header className="bg-white/80 backdrop-blur-md border-b border-orange-100 sticky top-0 z-40">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              🍳 Что приготовить?
            </h1>
            <p className="text-xs text-gray-400">
              Семья {FAMILY.mom}, {FAMILY.dad}, {FAMILY.son1}, {FAMILY.son2} & {FAMILY.daughter} · {FAMILY.city}
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-orange-500 font-medium bg-orange-50 px-2 py-1 rounded-full">
              Magnum 🛒
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6">
        {view === "plan" && mealPlan ? <MealPlanView /> : <Wizard />}
      </div>

      <footer className="max-w-lg mx-auto px-4 py-8 text-center text-xs text-gray-400">
        <p>Сделано с ❤️ для семьи</p>
        <p className="mt-1">Цены из каталога Magnum Cash & Carry, Алматы</p>
      </footer>
    </main>
  );
}
