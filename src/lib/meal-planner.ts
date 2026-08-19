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
import { findBestProduct, mapPool } from "./magnum";
import { DAYS_OF_WEEK } from "./types";
import { generateId } from "./utils";
import { combineAmounts } from "./scale-ingredients";
import { getCategoriesForDay, normalizeSpecialDays } from "./day-categories";
import { attachMealCosts } from "./meal-costs";

export { attachMealCosts } from "./meal-costs";

const MEAL_TYPE_ORDER: MealType[] = ["breakfast", "lunch", "dinner"];

function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function categoryOverlap(recipe: Recipe, categories: MealCategory[]): number {
  if (categories.length === 0) return 0;
  return categories.filter((c) => recipe.categories.includes(c)).length;
}

function scoreRecipe(
  recipe: Recipe,
  categories: MealCategory[],
  usedIds: Set<string>,
  likedIds: Set<string>,
  dislikedIds: Set<string>
): number {
  if (usedIds.has(recipe.id)) return -10000;

  let score = Math.random() * 20;

  if (likedIds.has(recipe.id) || likedIds.has(recipe.name.toLowerCase())) {
    score += 22;
  }
  if (dislikedIds.has(recipe.id) || dislikedIds.has(recipe.name.toLowerCase())) {
    score -= 28;
  }

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
  if (categories.includes("family-favorites") && likedIds.has(recipe.id)) {
    score += 16;
  }

  return score;
}

function pickRecipe(
  categories: MealCategory[],
  excludeCategories: MealCategory[],
  diet: DietType,
  mealType: MealType,
  usedByType: Map<MealType, Set<string>>,
  excludeIds: Set<string>,
  likedIds: Set<string>,
  dislikedIds: Set<string>
): Recipe {
  const usedIds = usedByType.get(mealType) ?? new Set<string>();

  const matching = filterRecipes(categories, diet, mealType).filter((r) => {
    if (usedIds.has(r.id)) return false;
    if (excludeCategories.some((c) => r.categories.includes(c))) return false;
    return true;
  });

  const unusedMatching = matching.filter((r) => !excludeIds.has(r.id));
  let pool = unusedMatching.length > 0 ? unusedMatching : matching;

  if (pool.length === 0) {
    const anyForType = filterRecipes([], diet, mealType).filter((r) => {
      if (usedIds.has(r.id)) return false;
      if (excludeCategories.some((c) => r.categories.includes(c))) return false;
      return true;
    });
    pool =
      anyForType.length > 0
        ? anyForType
        : filterRecipes([], diet, mealType).filter((r) => !usedIds.has(r.id));
  }

  if (pool.length === 0) {
    return RECIPES[Math.floor(Math.random() * RECIPES.length)] ?? RECIPES[0];
  }

  const scored = shuffle(pool)
    .map((r) => ({
      recipe: r,
      score: scoreRecipe(r, categories, usedIds, likedIds, dislikedIds),
    }))
    .sort((a, b) => b.score - a.score);

  const windowSize = Math.max(2, Math.ceil(scored.length * 0.45));
  const top = scored.slice(0, windowSize);
  return top[Math.floor(Math.random() * top.length)].recipe;
}

export function selectWeeklyMeals(
  categories: MealCategory[],
  diet: DietType,
  excludeIds: string[] = [],
  specialDays: number[] = [],
  likedIds: string[] = [],
  dislikedIds: string[] = []
): DayMeal[] {
  const meals: DayMeal[] = [];
  const usedByType = new Map<MealType, Set<string>>();
  const recent = new Set(excludeIds);
  const liked = new Set(
    likedIds.flatMap((id) => {
      const recipe = RECIPES.find((r) => r.id === id);
      return recipe ? [id, recipe.name.toLowerCase()] : [id];
    })
  );
  const disliked = new Set(
    dislikedIds.flatMap((id) => {
      const recipe = RECIPES.find((r) => r.id === id);
      return recipe ? [id, recipe.name.toLowerCase()] : [id];
    })
  );
  for (const mt of MEAL_TYPE_ORDER) {
    usedByType.set(mt, new Set());
  }

  const days = normalizeSpecialDays(categories, specialDays);

  for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
    const dayCats = getCategoriesForDay(categories, days, dayIndex);
    for (const mealType of MEAL_TYPE_ORDER) {
      const recipe = pickRecipe(
        dayCats.categories,
        dayCats.exclude,
        diet,
        mealType,
        usedByType,
        recent,
        liked,
        disliked
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
    { name: string; amounts: string[]; magnumSearch: string }
  >();

  for (const recipe of recipes) {
    for (const ing of recipe.ingredients) {
      const key = ing.magnumSearch.toLowerCase();
      const existing = ingredientMap.get(key);
      if (!existing) {
        ingredientMap.set(key, {
          name: ing.name,
          amounts: [ing.amount],
          magnumSearch: ing.magnumSearch,
        });
      } else {
        existing.amounts.push(ing.amount);
      }
    }
  }

  const entries = [...ingredientMap.values()];
  const products = await mapPool(entries, 8, (data) =>
    findBestProduct(data.magnumSearch)
  );

  const shoppingItems: ShoppingItem[] = entries.map((data, index) => {
    const product = products[index];
    return {
      id: generateId(),
      ingredientName: data.name,
      amount: combineAmounts(data.amounts),
      magnumSearch: data.magnumSearch,
      magnumProduct: product ?? undefined,
      price: product?.finalPrice ?? 0,
      checked: false,
    };
  });

  return shoppingItems.sort((a, b) =>
    a.ingredientName.localeCompare(b.ingredientName, "ru")
  );
}

export async function generateMealPlan(
  categories: MealCategory[],
  diet: DietType,
  budget: BudgetOption,
  customBudget?: number,
  excludeIds: string[] = [],
  specialDays: number[] = [],
  likedIds: string[] = [],
  dislikedIds: string[] = []
): Promise<MealPlan> {
  const days = normalizeSpecialDays(categories, specialDays);
  const meals = selectWeeklyMeals(
    categories,
    diet,
    excludeIds,
    days,
    likedIds,
    dislikedIds
  );
  const recipes = meals.map((m) => m.recipe);
  const shoppingList = await buildShoppingList(recipes);
  const totalCost = shoppingList.reduce((sum, item) => sum + item.price, 0);
  const pricedMeals = attachMealCosts(meals, shoppingList);

  return {
    id: generateId(),
    createdAt: new Date().toISOString(),
    budget,
    customBudget,
    categories,
    specialDays: days,
    diet,
    meals: pricedMeals,
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

  const dayCats = getCategoriesForDay(
    plan.categories,
    plan.specialDays ?? [],
    dayIndex
  );

  const pool = filterRecipes(dayCats.categories, plan.diet, mealType).filter(
    (r) => {
      if (r.id === currentId || usedIds.has(r.id)) return false;
      if (dayCats.exclude.some((c) => r.categories.includes(c))) return false;
      return true;
    }
  );

  const fallback = filterRecipes([], plan.diet, mealType).filter(
    (r) => r.id !== currentId && !usedIds.has(r.id)
  );

  const list = pool.length > 0 ? pool : fallback;

  return shuffle(list)
    .map((recipe) => ({
      recipe,
      score: scoreRecipe(
        recipe,
        dayCats.categories,
        usedIds,
        new Set(),
        new Set()
      ),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)
    .map((entry) => entry.recipe);
}
