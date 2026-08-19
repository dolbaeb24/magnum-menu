"use client";

import { useEffect, useMemo, useState } from "react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FAMILY, FAMILY_MEMBERS, type FamilyMemberId } from "@/lib/types";
import { RECIPES } from "@/lib/recipes";
import { Heart, X, ChefHat } from "lucide-react";

const CHILD_IDS: FamilyMemberId[] = ["slava", "danil", "lera"];
const ONBOARD_ORDER = [
  ...FAMILY_MEMBERS.filter((m) => CHILD_IDS.includes(m.id)),
  ...FAMILY_MEMBERS.filter((m) => !CHILD_IDS.includes(m.id)),
];

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function dishesForMember(memberId: FamilyMemberId) {
  const favorites = RECIPES.filter((r) => r.familyFavorite);
  const kidsPool = RECIPES.filter(
    (r) =>
      r.categories.includes("kids") ||
      r.categories.includes("family-favorites") ||
      r.familyFavorite
  );
  const pool = CHILD_IDS.includes(memberId)
    ? kidsPool.length >= 8
      ? kidsPool
      : RECIPES
    : [...favorites, ...RECIPES.filter((r) => !r.familyFavorite)];
  const unique = pool.filter(
    (recipe, index, arr) => arr.findIndex((r) => r.id === recipe.id) === index
  );
  return shuffle(unique).slice(0, 10);
}

export function OnboardingFavorites() {
  const { recordTaste, completeOnboarding, familyTastes, resetFamilyTastes } =
    useAppStore();
  const [memberIndex, setMemberIndex] = useState(0);
  const [cardIndex, setCardIndex] = useState(0);
  const [started, setStarted] = useState(false);

  const member = ONBOARD_ORDER[memberIndex];
  const dishes = useMemo(
    () => (member ? dishesForMember(member.id) : []),
    [member]
  );
  const dish = dishes[cardIndex];
  const tastes = member ? familyTastes[member.id] : undefined;

  function nextCard() {
    if (cardIndex + 1 < dishes.length) {
      setCardIndex(cardIndex + 1);
      return;
    }
    if (memberIndex + 1 < ONBOARD_ORDER.length) {
      setMemberIndex(memberIndex + 1);
      setCardIndex(0);
      return;
    }
    completeOnboarding();
  }

  function vote(liked: boolean) {
    if (!member || !dish) return;
    recordTaste(member.id, dish.id, liked);
    nextCard();
  }

  useEffect(() => {
    if (started && (!member || !dish)) {
      completeOnboarding();
    }
  }, [started, member, dish, completeOnboarding]);

  if (!started) {
    return (
      <div className="space-y-5 py-4">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-100">
            <Heart className="w-8 h-8 text-rose-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">
            {FAMILY.mom}, что любит семья?
          </h2>
          <p className="text-sm text-gray-500 px-2">
            Как в Tinder: блюдо за блюдом. Для каждого — «любит» или «нет».
            Потом любимые попадут в категорию «Любимые семьи».
          </p>
        </div>
        <Button size="lg" className="w-full min-h-[48px]" onClick={() => {
          resetFamilyTastes();
          setStarted(true);
        }}>
          Начать с {ONBOARD_ORDER[0].name} →
        </Button>
        <button
          type="button"
          className="w-full text-sm text-gray-400 py-2"
          onClick={() => completeOnboarding()}
        >
          Пропустить пока
        </button>
      </div>
    );
  }

  if (!member || !dish) {
    return (
      <p className="text-center text-sm text-gray-400 py-10">Сохраняем ответы…</p>
    );
  }

  const likedCount = tastes?.liked.length ?? 0;

  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-xs text-orange-600 font-medium">
          {member.emoji} {member.name} · {member.role}
        </p>
        <p className="text-[11px] text-gray-400 mt-0.5">
          Блюдо {cardIndex + 1} из {dishes.length} · ❤️ {likedCount}
        </p>
        <div className="h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
          <div
            className="h-full bg-orange-400 rounded-full"
            style={{
              width: `${((memberIndex * dishes.length + cardIndex) / Math.max(1, ONBOARD_ORDER.length * dishes.length)) * 100}%`,
            }}
          />
        </div>
      </div>

      <Card className="!p-5 min-h-[220px] flex flex-col justify-center text-center space-y-3">
        <ChefHat className="w-10 h-10 text-orange-400 mx-auto" />
        <h3 className="text-xl font-bold text-gray-900 break-words">
          {dish.name}
        </h3>
        <p className="text-sm text-gray-500">{dish.description}</p>
        <p className="text-xs text-gray-400">
          {dish.prepTime + dish.cookTime} мин · {dish.calories} ккал
        </p>
      </Card>

      <div className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1 min-h-[56px] border-gray-300 text-gray-700"
          onClick={() => vote(false)}
        >
          <X className="w-5 h-5 mr-1" />
          Не любит
        </Button>
        <Button
          className="flex-1 min-h-[56px] bg-rose-500 hover:bg-rose-600"
          onClick={() => vote(true)}
        >
          <Heart className="w-5 h-5 mr-1" />
          Любит
        </Button>
      </div>

      <div className="flex justify-between text-xs">
        <button
          type="button"
          className="text-gray-400 py-2"
          onClick={nextCard}
        >
          Пропустить блюдо
        </button>
        <button
          type="button"
          className="text-orange-600 py-2"
          onClick={() => {
            if (memberIndex + 1 < ONBOARD_ORDER.length) {
              setMemberIndex(memberIndex + 1);
              setCardIndex(0);
            } else {
              completeOnboarding();
            }
          }}
        >
          Следующий человек →
        </button>
      </div>
    </div>
  );
}
