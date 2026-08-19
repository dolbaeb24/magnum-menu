import type {
  MealCategory,
  DietType,
  BudgetOption,
  Recipe,
  DayMeal,
  ShoppingItem,
  MealPlan,
} from "./types";
import { RECIPES, filterRecipes } from "./recipes";
import { findBestProduct } from "./magnum";
import { DAYS_OF_WEEK } from "./types";
import { generateId } from "./utils";

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

export function selectWeeklyMeals(
  categories: MealCategory[],
  diet: DietType,
  excludeIds: string[] = []
): Recipe[] {
  const filtered = filterRecipes(categories, diet);
  const available = filtered.filter((r) => !excludeIds.includes(r.id));

  if (available.length === 0) {
    return shuffle(RECIPES.filter((r) => !excludeIds.includes(r.id))).slice(0, 7);
  }

  const selected: Recipe[] = [];
  const usedIds = new Set<string>(excludeIds);

  for (let day = 0; day < 7; day++) {
    const candidates = available.filter((r) => !usedIds.has(r.id));
    if (candidates.length === 0) {
      const fallback = RECIPES.find((r) => !usedIds.has(r.id));
      if (fallback) {
        selected.push(fallback);
        usedIds.add(fallback.id);
      }
      continue;
    }

    const scored = candidates
      .map((r) => ({ recipe: r, score: scoreRecipe(r, categories, usedIds) }))
      .sort((a, b) => b.score - a.score);

    const topCandidates = scored.slice(0, Math.min(3, scored.length));
    const pick =
      topCandidates[Math.floor(Math.random() * topCandidates.length)].recipe;

    selected.push(pick);
    usedIds.add(pick.id);
  }

  return selected;
}

export async function buildShoppingList(
  recipes: Recipe[],
  familySize: number = 5
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

  for (const [key, data] of ingredientMap) {
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

  return shoppingItems.sort((a, b) => a.ingredientName.localeCompare(b.ingredientName));
}

export async function generateMealPlan(
  categories: MealCategory[],
  diet: DietType,
  budget: BudgetOption,
  customBudget?: number
): Promise<MealPlan> {
  const recipes = selectWeeklyMeals(categories, diet);
  const shoppingList = await buildShoppingList(recipes);
  const totalCost = shoppingList.reduce((sum, item) => sum + item.price, 0);

  const budgetLimit = getBudgetLimit(budget, customBudget);
  if (budgetLimit && totalCost > budgetLimit) {
    const cheaperRecipes = recipes.filter(
      (r) => r.categories.includes("quick") || r.categories.includes("low-cal")
    );
    if (cheaperRecipes.length >= 3) {
      return generateMealPlan(
        [...categories, "quick" as MealCategory],
        diet,
        budget,
        customBudget
      );
    }
  }

  const meals: DayMeal[] = recipes.map((recipe, index) => ({
    day: DAYS_OF_WEEK[index],
    dayIndex: index,
    recipe,
  }));

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

export function swapMeal(
  plan: MealPlan,
  dayIndex: number,
  newRecipe: Recipe
): MealPlan {
  const newMeals = plan.meals.map((m) =>
    m.dayIndex === dayIndex ? { ...m, recipe: newRecipe } : m
  );

  return {
    ...plan,
    meals: newMeals,
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
  dayIndex: number
): Recipe[] {
  const currentId = plan.meals[dayIndex]?.recipe.id;
  const usedIds = plan.meals.map((m) => m.recipe.id);

  return filterRecipes(plan.categories, plan.diet).filter(
    (r) => r.id !== currentId && !usedIds.includes(r.id)
  );
}
