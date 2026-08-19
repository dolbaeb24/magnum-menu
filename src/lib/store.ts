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
} from "./types";

interface AppState extends WizardState {
  mealPlan: MealPlan | null;
  isGenerating: boolean;
  view: "wizard" | "plan";

  setStep: (step: number) => void;
  setBudget: (budget: BudgetOption) => void;
  setCustomBudget: (amount: number) => void;
  toggleCategory: (category: MealCategory) => void;
  setDiet: (diet: DietType) => void;
  setMealPlan: (plan: MealPlan | null) => void;
  setIsGenerating: (val: boolean) => void;
  setView: (view: "wizard" | "plan") => void;
  toggleShoppingItem: (id: string) => void;
  updateShoppingItem: (id: string, updates: Partial<ShoppingItem>) => void;
  removeShoppingItem: (id: string) => void;
  addShoppingItem: (item: ShoppingItem) => void;
  swapMealInPlan: (dayIndex: number, recipeId: string) => void;
  resetWizard: () => void;
}

const initialWizard: WizardState = {
  step: 0,
  budget: "none",
  customBudget: 30000,
  categories: [],
  diet: "none",
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialWizard,
      mealPlan: null,
      isGenerating: false,
      view: "wizard",

      setStep: (step) => set({ step }),
      setBudget: (budget) => set({ budget }),
      setCustomBudget: (customBudget) => set({ customBudget }),
      toggleCategory: (category) => {
        const current = get().categories;
        if (current.includes(category)) {
          set({ categories: current.filter((c) => c !== category) });
        } else if (current.length < 3) {
          set({ categories: [...current, category] });
        }
      },
      setDiet: (diet) => set({ diet }),
      setMealPlan: (mealPlan) => set({ mealPlan, view: mealPlan ? "plan" : "wizard" }),
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
      swapMealInPlan: (dayIndex, recipeId) => {
        const plan = get().mealPlan;
        if (!plan) return;
        set({
          mealPlan: {
            ...plan,
            meals: plan.meals.map((m) =>
              m.dayIndex === dayIndex
                ? { ...m, recipe: { ...m.recipe, id: recipeId } }
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
    }),
    {
      name: "magnum-menu-storage",
      partialize: (state) => ({
        mealPlan: state.mealPlan,
        budget: state.budget,
        categories: state.categories,
        diet: state.diet,
      }),
    }
  )
);
