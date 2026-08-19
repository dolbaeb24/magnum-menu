"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { Wizard } from "@/components/wizard/Wizard";
import { MealPlanView } from "@/components/plan/MealPlanView";
import { OnboardingFavorites } from "@/components/onboarding/OnboardingFavorites";
import { AccountView } from "@/components/account/AccountView";
import { FAMILY } from "@/lib/types";
import { User } from "lucide-react";

export default function Home() {
  const { view, mealPlan, setView, onboardingComplete } = useAppStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const persist = useAppStore.persist;
    const markHydrated = () => setHydrated(true);
    if (typeof persist?.hasHydrated === "function" && persist.hasHydrated()) {
      markHydrated();
    }
    return persist?.onFinishHydration?.(markHydrated);
  }, []);

  const screen = !hydrated
    ? "loading"
    : !onboardingComplete || view === "onboarding"
      ? "onboarding"
      : view === "account"
        ? "account"
        : mealPlan
          ? "plan"
          : "wizard";

  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-amber-50 overflow-x-hidden w-full">
      <header className="bg-white/90 backdrop-blur-md border-b border-orange-100 sticky top-0 z-40 safe-top">
        <div className="max-w-lg mx-auto px-3 py-3 flex items-center justify-between gap-2 w-full">
          <button
            type="button"
            className="min-w-0 flex-1 text-left"
            onClick={() =>
              setView(
                onboardingComplete
                  ? mealPlan
                    ? "plan"
                    : "wizard"
                  : "onboarding"
              )
            }
          >
            <h1 className="text-lg font-bold text-gray-900 truncate">
              🍳 Что приготовить?
            </h1>
            <p className="text-[11px] text-gray-400 truncate">
              {FAMILY.mom}, {FAMILY.dad}, {FAMILY.son1}, {FAMILY.son2}, {FAMILY.daughter} · {FAMILY.city}
            </p>
          </button>
          {hydrated && onboardingComplete && (
            <button
              type="button"
              onClick={() => setView("account")}
              className={`p-2 rounded-full min-w-[44px] min-h-[44px] flex items-center justify-center ${
                screen === "account"
                  ? "bg-orange-500 text-white"
                  : "bg-orange-50 text-orange-500"
              }`}
              aria-label="Профиль"
            >
              <User className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      <div className="max-w-lg mx-auto px-3 py-4 w-full min-w-0">
        {screen === "loading" ? (
          <div className="py-16 text-center text-sm text-gray-400">Загрузка…</div>
        ) : screen === "onboarding" ? (
          <OnboardingFavorites />
        ) : screen === "account" ? (
          <AccountView />
        ) : screen === "plan" ? (
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
