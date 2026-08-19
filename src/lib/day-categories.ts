import type { MealCategory } from "./types";

/** Categories that apply only to selected days, not the whole week. */
export const SPECIAL_DAY_CATEGORIES: MealCategory[] = ["indulge"];

export function isSpecialDayCategory(category: MealCategory): boolean {
  return SPECIAL_DAY_CATEGORIES.includes(category);
}

export function getBaseCategories(categories: MealCategory[]): MealCategory[] {
  return categories.filter((c) => !isSpecialDayCategory(c));
}

export function normalizeSpecialDays(
  categories: MealCategory[],
  specialDays: number[]
): number[] {
  const hasSpecial = categories.some(isSpecialDayCategory);
  if (!hasSpecial) return [];
  const unique = [...new Set(specialDays.filter((d) => d >= 0 && d <= 6))].sort(
    (a, b) => a - b
  );
  return unique.length > 0 ? unique : [5];
}

export function isIndulgeDay(
  categories: MealCategory[],
  specialDays: number[],
  dayIndex: number
): boolean {
  return (
    categories.includes("indulge") &&
    normalizeSpecialDays(categories, specialDays).includes(dayIndex)
  );
}

export function getCategoriesForDay(
  categories: MealCategory[],
  specialDays: number[],
  dayIndex: number
): { categories: MealCategory[]; exclude: MealCategory[] } {
  const hasIndulge = categories.includes("indulge");
  const base = getBaseCategories(categories);
  const days = normalizeSpecialDays(categories, specialDays);

  if (hasIndulge && days.includes(dayIndex)) {
    return { categories: ["indulge", ...base], exclude: [] };
  }

  if (hasIndulge) {
    return { categories: base, exclude: ["indulge"] };
  }

  return { categories, exclude: [] };
}
