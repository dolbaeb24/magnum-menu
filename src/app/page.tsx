"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { Wizard } from "@/components/wizard/Wizard";
import { MealPlanView } from "@/components/plan/MealPlanView";
import { FAMILY } from "@/lib/types";

export default function Home() {
  const { view, mealPlan, setView } = useAppStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const unsub = useAppStore.persist.onFinishHydration(() => setHydrated(true));
    if (useAppStore.persist.hasHydrated()) setHydrated(true);
    return unsub;
  }, []);

  useEffect(() => {
    if (hydrated && mealPlan && view === "wizard") {
      setView("plan");
    }
  }, [hydrated, mealPlan, view, setView]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-amber-50 overflow-x-hidden w-full">
      <header className="bg-white/90 backdrop-blur-md border-b border-orange-100 sticky top-0 z-40 safe-top">
        <div className="max-w-lg mx-auto px-3 py-3 flex items-center justify-between gap-2 w-full">
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-bold text-gray-900 truncate">
              🍳 Что приготовить?
            </h1>
            <p className="text-[11px] text-gray-400 truncate">
              {FAMILY.mom}, {FAMILY.dad}, {FAMILY.son1}, {FAMILY.son2}, {FAMILY.daughter} · {FAMILY.city}
            </p>
          </div>
          <span className="text-[10px] text-orange-500 font-medium bg-orange-50 px-2 py-1 rounded-full shrink-0">
            Magnum 🛒
          </span>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-3 py-4 w-full min-w-0">
        {!hydrated ? (
          <div className="py-16 text-center text-sm text-gray-400">Загрузка…</div>
        ) : view === "plan" && mealPlan ? (
          <MealPlanView />
        ) : (
          <Wizard />
        )}
      </div>

      <footer className="max-w-lg mx-auto px-3 py-6 text-center text-[11px] text-gray-400 safe-bottom">
        <p>Сделано с ❤️ для семьи</p>
        <p className="mt-0.5">Цены из Magnum, Алматы</p>
      </footer>
    </main>
  );
}
