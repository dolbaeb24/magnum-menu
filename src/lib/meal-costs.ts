import type { DayMeal, ShoppingItem } from "./types";

/** Approximate dish cost from Magnum shopping prices, splitting shared packs. */
export function attachMealCosts(
  meals: DayMeal[],
  shoppingList: ShoppingItem[]
): DayMeal[] {
  const prices = new Map<string, number>();
  for (const item of shoppingList) {
    if (item.magnumSearch) {
      prices.set(item.magnumSearch.toLowerCase(), item.price);
    }
  }

  const usage = new Map<string, number>();
  for (const meal of meals) {
    const seen = new Set<string>();
    for (const ing of meal.recipe.ingredients) {
      const key = ing.magnumSearch.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      usage.set(key, (usage.get(key) ?? 0) + 1);
    }
  }

  return meals.map((meal) => {
    const seen = new Set<string>();
    let estimatedCost = 0;
    for (const ing of meal.recipe.ingredients) {
      const key = ing.magnumSearch.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      const price = prices.get(key) ?? 0;
      const count = usage.get(key) ?? 1;
      estimatedCost += price / count;
    }
    return {
      ...meal,
      estimatedCost: Math.round(estimatedCost),
    };
  });
}
