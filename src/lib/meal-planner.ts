import type {
  MealCategory,
  DietType,
  BudgetOption,
  Recipe,
  DayMeal,
  ShoppingItem,
  MealPlan,
  MealType,
} from "./types";
import { RECIPES, filterRecipes } from "./recipes";
import { findBestProduct } from "./magnum";
import { DAYS_OF_WEEK } from "./types";
import { generateId } from "./utils";

const MEAL_TYPE_ORDER: MealType[] = ["breakfast", "lunch", "dinner"];

function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function getBudgetLimit(
  budget: BudgetOption,
  customBudget?: number
): number | null {
  if (budget === "none") return null;
  if (budget === "custom") return customBudget ?? null;
  return parseInt(budget, 10);
}

function scoreRecipe(
  recipe: Recipe,
  categories: MealCategory[],
  usedIds: Set<string>
): number {
  let score = 0;

  if (usedIds.has(recipe.id)) return -1000;

  for (const cat of categories) {
    if (recipe.categories.includes(cat)) score += 10;
  }

  if (recipe.familyFavorite) score += 5;

  score += Math.random() * 5;

  return score;
}

function pickRecipe(
  categories: MealCategory[],
  diet: DietType,
  mealType: MealType,
  usedIds: Set<string>
): Recipe {
  const candidates = filterRecipes(categories, diet, mealType).filter(
    (r) => !usedIds.has(r.id)
  );

  if (candidates.length === 0) {
    const fallback = filterRecipes([], diet, mealType).find(
      (r) => !usedIds.has(r.id)
    );
    if (fallback) return fallback;
    const any = RECIPES.find((r) => r.mealTypes.includes(mealType));
    if (any) return any;
    return RECIPES[0];
  }

  const scored = candidates
    .map((r) => ({ recipe: r, score: scoreRecipe(r, categories, usedIds) }))
    .sort((a, b) => b.score - a.score);

  const topCandidates = scored.slice(0, Math.min(3, scored.length));
  return topCandidates[Math.floor(Math.random() * topCandidates.length)].recipe;
}

export function selectWeeklyMeals(
  categories: MealCategory[],
  diet: DietType,
  excludeIds: string[] = []
): DayMeal[] {
  const meals: DayMeal[] = [];
  const usedIds = new Set<string>(excludeIds);

  for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
    for (const mealType of MEAL_TYPE_ORDER) {
      const recipe = pickRecipe(categories, diet, mealType, usedIds);
      meals.push({
        day: DAYS_OF_WEEK[dayIndex],
        dayIndex,
        mealType,
        recipe,
      });
      usedIds.add(recipe.id);
    }
  }

  return meals;
}

export async function buildShoppingList(
  recipes: Recipe[]
): Promise<ShoppingItem[]> {
  const ingredientMap = new Map<
    string,
    { amount: string; magnumSearch: string }
  >();

  for (const recipe of recipes) {
    for (const ing of recipe.ingredients) {
      const key = ing.magnumSearch.toLowerCase();
      if (!ingredientMap.has(key)) {
        ingredientMap.set(key, {
          amount: ing.amount,
          magnumSearch: ing.magnumSearch,
        });
      }
    }
  }

  const shoppingItems: ShoppingItem[] = [];

  for (const [, data] of ingredientMap) {
    const product = await findBestProduct(data.magnumSearch);
    shoppingItems.push({
      id: generateId(),
      ingredientName: data.magnumSearch,
      amount: data.amount,
      magnumProduct: product ?? undefined,
      price: product?.finalPrice ?? 599,
      checked: false,
    });
  }

  return shoppingItems.sort((a, b) =>
    a.ingredientName.localeCompare(b.ingredientName)
  );
}

export async function generateMealPlan(
  categories: MealCategory[],
  diet: DietType,
  budget: BudgetOption,
  customBudget?: number
): Promise<MealPlan> {
  const meals = selectWeeklyMeals(categories, diet);
  const recipes = meals.map((m) => m.recipe);
  const shoppingList = await buildShoppingList(recipes);
  const totalCost = shoppingList.reduce((sum, item) => sum + item.price, 0);

  const budgetLimit = getBudgetLimit(budget, customBudget);
  if (budgetLimit && totalCost > budgetLimit) {
    const hasQuick = categories.includes("quick");
    if (!hasQuick) {
      return generateMealPlan(
        [...categories, "quick" as MealCategory],
        diet,
        budget,
        customBudget
      );
    }
  }

  return {
    id: generateId(),
    createdAt: new Date().toISOString(),
    budget,
    customBudget,
    categories,
    diet,
    meals,
    shoppingList,
    totalCost,
  };
}

export async function regenerateShoppingList(
  plan: MealPlan
): Promise<ShoppingItem[]> {
  const recipes = plan.meals.map((m) => m.recipe);
  return buildShoppingList(recipes);
}

export function getAlternativeRecipes(
  plan: MealPlan,
  dayIndex: number,
  mealType: MealType
): Recipe[] {
  const currentMeal = plan.meals.find(
    (m) => m.dayIndex === dayIndex && m.mealType === mealType
  );
  const currentId = currentMeal?.recipe.id;
  const usedIds = plan.meals
    .filter((m) => !(m.dayIndex === dayIndex && m.mealType === mealType))
    .map((m) => m.recipe.id);

  return filterRecipes(plan.categories, plan.diet, mealType).filter(
    (r) => r.id !== currentId && !usedIds.includes(r.id)
  );
}
