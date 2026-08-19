"use client";

import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  FAMILY,
  FAMILY_MEMBERS,
  CATEGORY_LABELS,
  MEAL_TYPE_LABELS,
  DAYS_OF_WEEK,
} from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { RECIPES } from "@/lib/recipes";
import { Heart, History, RotateCcw, User } from "lucide-react";

export function AccountView() {
  const {
    familyTastes,
    planHistory,
    startOnboarding,
    setView,
    mealPlan,
  } = useAppStore();

  const likedIds = new Set(
    Object.values(familyTastes).flatMap((t) => t.liked)
  );
  const likedRecipes = RECIPES.filter((r) => likedIds.has(r.id));

  return (
    <div className="space-y-5 pb-4">
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-4 text-white">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">{FAMILY.mom}</h1>
            <p className="text-orange-100 text-xs">
              Семья · {FAMILY.city} · {FAMILY.size} человек
            </p>
          </div>
        </div>
      </div>

      <section className="space-y-2">
        <h2 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
          <Heart className="w-4 h-4 text-rose-500" />
          Любимые блюда семьи
        </h2>
        {FAMILY_MEMBERS.map((member) => {
          const liked = familyTastes[member.id]?.liked ?? [];
          const names = liked
            .map((id) => RECIPES.find((r) => r.id === id)?.name)
            .filter(Boolean);
          return (
            <Card key={member.id} className="!p-3">
              <p className="text-sm font-semibold text-gray-900">
                {member.emoji} {member.name}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {names.length > 0 ? names.join(", ") : "Пока не отмечено"}
              </p>
            </Card>
          );
        })}
        <Button
          variant="outline"
          className="w-full min-h-[44px]"
          onClick={() => startOnboarding()}
        >
          <RotateCcw className="w-4 h-4 mr-1" />
          Пройти опрос ещё раз
        </Button>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
          <History className="w-4 h-4 text-orange-500" />
          Предыдущие недели
        </h2>
        {planHistory.length === 0 && !mealPlan ? (
          <p className="text-sm text-gray-400 text-center py-6">
            Пока нет сохранённых меню
          </p>
        ) : (
          <div className="space-y-2">
            {mealPlan && (
              <Card className="!p-3 border-orange-200">
                <p className="text-xs text-orange-600 font-medium">Сейчас</p>
                <p className="text-sm font-semibold text-gray-900">
                  {new Date(mealPlan.createdAt).toLocaleDateString("ru-KZ")} ·{" "}
                  {formatPrice(mealPlan.totalCost)}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {mealPlan.categories
                    .map((c) => CATEGORY_LABELS[c]?.label)
                    .filter(Boolean)
                    .join(" · ") || "Без категорий"}
                </p>
              </Card>
            )}
            {planHistory.map((item) => (
              <Card key={item.id} className="!p-3">
                <p className="text-sm font-semibold text-gray-900">
                  {new Date(item.createdAt).toLocaleDateString("ru-KZ")} ·{" "}
                  {formatPrice(item.totalCost)}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {item.categories
                    .map((c) => CATEGORY_LABELS[c]?.label)
                    .filter(Boolean)
                    .join(" · ") || "Без категорий"}
                </p>
                <ul className="mt-2 space-y-0.5">
                  {DAYS_OF_WEEK.map((day, i) => {
                    const dayMeals = item.meals.filter((m) => m.dayIndex === i);
                    if (dayMeals.length === 0) return null;
                    return (
                      <li key={day} className="text-[11px] text-gray-600">
                        <span className="font-medium">{day}:</span>{" "}
                        {dayMeals
                          .map(
                            (m) =>
                              `${MEAL_TYPE_LABELS[m.mealType].emoji} ${m.recipeName}`
                          )
                          .join(" · ")}
                      </li>
                    );
                  })}
                </ul>
              </Card>
            ))}
          </div>
        )}
      </section>

      {likedRecipes.length > 0 && (
        <p className="text-[11px] text-gray-400 text-center">
          {likedRecipes.length} блюд отмечены как любимые — они чаще попадут в
          «Любимые семьи».
        </p>
      )}

      <Button
        className="w-full min-h-[48px]"
        onClick={() => setView(mealPlan ? "plan" : "wizard")}
      >
        {mealPlan ? "К текущему меню" : "Составить меню"}
      </Button>
    </div>
  );
}
