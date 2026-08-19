"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  WizardState,
  MealPlan,
  BudgetOption,
  MealCategory,
  DietType,
  ShoppingItem,
  MealType,
  Recipe,
  FamilyMemberId,
  MemberTastes,
  PlanHistoryItem,
} from "./types";
import { isNonFoodProduct } from "./magnum-filters";
import { attachMealCosts } from "./meal-costs";

type AppView = "wizard" | "plan" | "account" | "onboarding";

interface AppState extends WizardState {
  mealPlan: MealPlan | null;
  isGenerating: boolean;
  view: AppView;

  onboardingComplete: boolean;
  familyTastes: Record<FamilyMemberId, MemberTastes>;
  servingsByRecipeId: Record<string, number>;
  planHistory: PlanHistoryItem[];

  setStep: (step: number) => void;
  setBudget: (budget: BudgetOption) => void;
  setCustomBudget: (amount: number) => void;
  toggleCategory: (category: MealCategory) => void;
  setDiet: (diet: DietType) => void;
  toggleSpecialDay: (dayIndex: number) => void;
  setMealPlan: (plan: MealPlan | null) => void;
  setIsGenerating: (val: boolean) => void;
  setView: (view: AppView) => void;
  toggleShoppingItem: (id: string) => void;
  updateShoppingItem: (id: string, updates: Partial<ShoppingItem>) => void;
  removeShoppingItem: (id: string) => void;
  addShoppingItem: (item: ShoppingItem) => void;
  swapMealInPlan: (dayIndex: number, mealType: MealType, recipe: Recipe) => void;
  resetWizard: () => void;
  recentRecipeIds: string[];
  recentRecipeNames: string[];
  setRecipeServings: (recipeId: string, servings: number) => void;
  recordTaste: (
    memberId: FamilyMemberId,
    recipeId: string,
    liked: boolean
  ) => void;
  completeOnboarding: () => void;
  startOnboarding: () => void;
  resetFamilyTastes: () => void;
  likedRecipeIds: () => string[];
  dislikedRecipeIds: () => string[];
}

const emptyTastes = (): Record<FamilyMemberId, MemberTastes> => ({
  olesya: { liked: [], disliked: [] },
  stanislav: { liked: [], disliked: [] },
  slava: { liked: [], disliked: [] },
  danil: { liked: [], disliked: [] },
  lera: { liked: [], disliked: [] },
});

const initialWizard: WizardState = {
  step: 0,
  budget: "none",
  customBudget: 90000,
  categories: [],
  specialDays: [],
  diet: "none",
};

function sanitizeMealPlan(plan: MealPlan | null | undefined): MealPlan | null {
  if (!plan) return null;
  const shoppingList = plan.shoppingList.map((item) => {
    const productName = item.magnumProduct?.name ?? "";
    if (productName && isNonFoodProduct(productName)) {
      return {
        ...item,
        magnumProduct: undefined,
        price: 0,
      };
    }
    return item;
  });
  const meals = attachMealCosts(plan.meals, shoppingList);
  const totalCost = shoppingList.reduce((sum, item) => sum + item.price, 0);
  return { ...plan, shoppingList, meals, totalCost };
}

function toHistoryItem(plan: MealPlan): PlanHistoryItem {
  return {
    id: plan.id,
    createdAt: plan.createdAt,
    totalCost: plan.totalCost,
    categories: plan.categories,
    meals: plan.meals.map((m) => ({
      day: m.day,
      dayIndex: m.dayIndex,
      mealType: m.mealType,
      recipeName: m.recipe.name,
      estimatedCost: m.estimatedCost,
    })),
  };
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialWizard,
      mealPlan: null,
      isGenerating: false,
      view: "wizard",
      recentRecipeIds: [],
      recentRecipeNames: [],
      onboardingComplete: false,
      familyTastes: emptyTastes(),
      servingsByRecipeId: {},
      planHistory: [],

      setStep: (step) => set({ step }),
      setBudget: (budget) => set({ budget }),
      setCustomBudget: (customBudget) => set({ customBudget }),
      toggleCategory: (category) => {
        const current = get().categories;
        if (current.includes(category)) {
          const next = current.filter((c) => c !== category);
          set({
            categories: next,
            specialDays: category === "indulge" ? [] : get().specialDays,
          });
        } else if (current.length < 3) {
          set({
            categories: [...current, category],
            specialDays:
              category === "indulge" && get().specialDays.length === 0
                ? [5]
                : get().specialDays,
          });
        }
      },
      toggleSpecialDay: (dayIndex) => {
        const current = get().specialDays;
        const next = current.includes(dayIndex)
          ? current.filter((d) => d !== dayIndex)
          : [...current, dayIndex].sort((a, b) => a - b);
        set({ specialDays: next.length > 0 ? next : [dayIndex] });
      },
      setDiet: (diet) => set({ diet }),
      setMealPlan: (mealPlan) => {
        if (!mealPlan) {
          set({ mealPlan: null, view: "wizard" });
          return;
        }
        const next = sanitizeMealPlan(mealPlan) ?? mealPlan;
        const prev = get().mealPlan;
        let planHistory = get().planHistory;
        if (prev && prev.id !== next.id) {
          planHistory = [toHistoryItem(prev), ...planHistory]
            .filter((h, i, arr) => arr.findIndex((x) => x.id === h.id) === i)
            .slice(0, 8);
        }
        const ids = next.meals.map((m) => m.recipe.id);
        const names = next.meals.map((m) => m.recipe.name);
        const recentRecipeIds = [
          ...new Set([...ids, ...get().recentRecipeIds]),
        ].slice(0, 42);
        const recentRecipeNames = [
          ...new Set([...names, ...get().recentRecipeNames]),
        ].slice(0, 42);
        set({
          mealPlan: next,
          view: "plan",
          recentRecipeIds,
          recentRecipeNames,
          planHistory,
        });
      },
      setIsGenerating: (isGenerating) => set({ isGenerating }),
      setView: (view) => set({ view }),
      toggleShoppingItem: (id) => {
        const plan = get().mealPlan;
        if (!plan) return;
        set({
          mealPlan: {
            ...plan,
            shoppingList: plan.shoppingList.map((item) =>
              item.id === id ? { ...item, checked: !item.checked } : item
            ),
          },
        });
      },
      updateShoppingItem: (id, updates) => {
        const plan = get().mealPlan;
        if (!plan) return;
        set({
          mealPlan: {
            ...plan,
            shoppingList: plan.shoppingList.map((item) =>
              item.id === id ? { ...item, ...updates, manualEdit: true } : item
            ),
          },
        });
      },
      removeShoppingItem: (id) => {
        const plan = get().mealPlan;
        if (!plan) return;
        set({
          mealPlan: {
            ...plan,
            shoppingList: plan.shoppingList.filter((item) => item.id !== id),
          },
        });
      },
      addShoppingItem: (item) => {
        const plan = get().mealPlan;
        if (!plan) return;
        set({
          mealPlan: {
            ...plan,
            shoppingList: [...plan.shoppingList, item],
          },
        });
      },
      swapMealInPlan: (dayIndex, mealType, recipe) => {
        const plan = get().mealPlan;
        if (!plan) return;
        set({
          mealPlan: {
            ...plan,
            meals: plan.meals.map((m) =>
              m.dayIndex === dayIndex && m.mealType === mealType
                ? { ...m, recipe }
                : m
            ),
          },
        });
      },
      resetWizard: () =>
        set({
          ...initialWizard,
          mealPlan: null,
          view: "wizard",
        }),
      setRecipeServings: (recipeId, servings) =>
        set({
          servingsByRecipeId: {
            ...get().servingsByRecipeId,
            [recipeId]: servings,
          },
        }),
      recordTaste: (memberId, recipeId, liked) => {
        const current = get().familyTastes[memberId] ?? {
          liked: [],
          disliked: [],
        };
        const likedList = current.liked.filter((id) => id !== recipeId);
        const dislikedList = current.disliked.filter((id) => id !== recipeId);
        if (liked) likedList.push(recipeId);
        else dislikedList.push(recipeId);
        set({
          familyTastes: {
            ...get().familyTastes,
            [memberId]: { liked: likedList, disliked: dislikedList },
          },
        });
      },
      resetFamilyTastes: () => set({ familyTastes: emptyTastes() }),
      completeOnboarding: () =>
        set({ onboardingComplete: true, view: get().mealPlan ? "plan" : "wizard" }),
      startOnboarding: () => set({ view: "onboarding" }),
      likedRecipeIds: () => {
        const all = Object.values(get().familyTastes).flatMap((t) => t.liked);
        return [...new Set(all)];
      },
      dislikedRecipeIds: () => {
        const all = Object.values(get().familyTastes).flatMap((t) => t.disliked);
        return [...new Set(all)];
      },
    }),
    {
      name: "magnum-menu-storage",
      partialize: (state) => ({
        mealPlan: state.mealPlan,
        budget: state.budget,
        categories: state.categories,
        specialDays: state.specialDays,
        diet: state.diet,
        recentRecipeIds: state.recentRecipeIds,
        recentRecipeNames: state.recentRecipeNames,
        onboardingComplete: state.onboardingComplete,
        familyTastes: state.familyTastes,
        servingsByRecipeId: state.servingsByRecipeId,
        planHistory: state.planHistory,
      }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<AppState>;
        return {
          ...current,
          ...p,
          familyTastes: { ...emptyTastes(), ...p.familyTastes },
          servingsByRecipeId: p.servingsByRecipeId ?? {},
          planHistory: p.planHistory ?? [],
          onboardingComplete: p.onboardingComplete ?? Boolean(p.mealPlan),
          mealPlan: sanitizeMealPlan(p.mealPlan) ?? p.mealPlan ?? null,
        };
      },
    }
  )
);
