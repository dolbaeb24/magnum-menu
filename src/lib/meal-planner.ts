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

function categoryOverlap(recipe: Recipe, categories: MealCategory[]): number {
  if (categories.length === 0) return 0;
  return categories.filter((c) => recipe.categories.includes(c)).length;
}

function scoreRecipe(
  recipe: Recipe,
  categories: MealCategory[],
  usedIds: Set<string>
): number {
  if (usedIds.has(recipe.id)) return -10000;

  let score = Math.random() * 20;

  if (categories.length > 0) {
    const overlap = categoryOverlap(recipe, categories);
    if (overlap === 0) {
      score -= 80;
    } else {
      score += overlap * 30;
      const extraTags = recipe.categories.filter((c) => !categories.includes(c));
      score -= extraTags.length * 4;
    }
  }

  if (recipe.familyFavorite && categories.includes("family-favorites")) {
    score += 8;
  }

  return score;
}

function pickRecipe(
  categories: MealCategory[],
  diet: DietType,
  mealType: MealType,
  usedByType: Map<MealType, Set<string>>,
  excludeIds: Set<string>
): Recipe {
  const usedIds = usedByType.get(mealType) ?? new Set<string>();

  const matching = filterRecipes(categories, diet, mealType).filter(
    (r) => !usedIds.has(r.id)
  );

  const unusedMatching = matching.filter((r) => !excludeIds.has(r.id));
  let pool = unusedMatching.length > 0 ? unusedMatching : matching;

  if (pool.length === 0) {
    const anyForType = filterRecipes([], diet, mealType).filter(
      (r) => !usedIds.has(r.id)
    );
    pool = anyForType.length > 0 ? anyForType : filterRecipes([], diet, mealType);
  }

  if (pool.length === 0) {
    return RECIPES[Math.floor(Math.random() * RECIPES.length)] ?? RECIPES[0];
  }

  const scored = shuffle(pool)
    .map((r) => ({ recipe: r, score: scoreRecipe(r, categories, usedIds) }))
    .sort((a, b) => b.score - a.score);

  const windowSize = Math.max(2, Math.ceil(scored.length * 0.45));
  const top = scored.slice(0, windowSize);
  return top[Math.floor(Math.random() * top.length)].recipe;
}

export function selectWeeklyMeals(
  categories: MealCategory[],
  diet: DietType,
  excludeIds: string[] = []
): DayMeal[] {
  const meals: DayMeal[] = [];
  const usedByType = new Map<MealType, Set<string>>();
  const recent = new Set(excludeIds);
  for (const mt of MEAL_TYPE_ORDER) {
    usedByType.set(mt, new Set());
  }

  for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
    for (const mealType of MEAL_TYPE_ORDER) {
      const recipe = pickRecipe(
        categories,
        diet,
        mealType,
        usedByType,
        recent
      );
      meals.push({
        day: DAYS_OF_WEEK[dayIndex],
        dayIndex,
        mealType,
        recipe,
      });
      usedByType.get(mealType)!.add(recipe.id);
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
      price: product?.finalPrice ?? 0,
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
  customBudget?: number,
  excludeIds: string[] = []
): Promise<MealPlan> {
  const meals = selectWeeklyMeals(categories, diet, excludeIds);
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
        customBudget,
        excludeIds
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
  const usedIds = new Set(
    plan.meals
      .filter((m) => !(m.dayIndex === dayIndex && m.mealType === mealType))
      .map((m) => m.recipe.id)
  );

  const pool = filterRecipes([], plan.diet, mealType).filter(
    (r) => r.id !== currentId && !usedIds.has(r.id)
  );

  return shuffle(pool)
    .map((recipe) => ({
      recipe,
      score: scoreRecipe(recipe, plan.categories, usedIds),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)
    .map((entry) => entry.recipe);
}
