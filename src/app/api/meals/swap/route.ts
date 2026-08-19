import { NextRequest, NextResponse } from "next/server";
import { getAlternativeRecipes, regenerateShoppingList } from "@/lib/meal-planner";
import { attachMealCosts } from "@/lib/meal-costs";
import { getRecipeById } from "@/lib/recipes";
import type { MealPlan, MealType, Recipe } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { plan, dayIndex, mealType, newRecipeId, newRecipe } = body as {
      plan: MealPlan;
      dayIndex: number;
      mealType: MealType;
      newRecipeId?: string;
      newRecipe?: Recipe;
    };

    if (newRecipeId || newRecipe) {
      const recipe = newRecipe ?? (newRecipeId ? getRecipeById(newRecipeId) : undefined);
      if (!recipe) {
        return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
      }

      const updatedMeals = plan.meals.map((m) =>
        m.dayIndex === dayIndex && m.mealType === mealType
          ? { ...m, recipe }
          : m
      );

      const updatedPlan: MealPlan = { ...plan, meals: updatedMeals };
      const shoppingList = await regenerateShoppingList(updatedPlan);
      const meals = attachMealCosts(updatedMeals, shoppingList);
      const totalCost = shoppingList
        .filter((i) => !i.checked)
        .reduce((sum, item) => sum + item.price, 0);

      return NextResponse.json({
        plan: { ...updatedPlan, meals, shoppingList, totalCost },
      });
    }

    const alternatives = getAlternativeRecipes(plan, dayIndex, mealType);
    return NextResponse.json({ alternatives });
  } catch {
    return NextResponse.json({ error: "Failed to swap meal" }, { status: 500 });
  }
}
