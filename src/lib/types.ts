export type MealCategory =
  | "quick"
  | "low-cal"
  | "family-favorites"
  | "healthy"
  | "indulge"
  | "kazakh"
  | "kids";

export type DietType =
  | "none"
  | "vegetarian"
  | "gluten-free"
  | "keto"
  | "low-carb";

export type BudgetOption =
  | "none"
  | "15000"
  | "25000"
  | "35000"
  | "50000"
  | "70000"
  | "custom";

export interface Ingredient {
  name: string;
  amount: string;
  magnumSearch: string;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  categories: MealCategory[];
  diets: DietType[];
  prepTime: number;
  cookTime: number;
  servings: number;
  calories: number;
  ingredients: Ingredient[];
  steps: string[];
  tags: string[];
  familyFavorite?: boolean;
}

export interface MagnumProduct {
  id: number;
  name: string;
  startPrice: number;
  finalPrice: number;
  discount: number;
}

export interface ShoppingItem {
  id: string;
  ingredientName: string;
  amount: string;
  magnumProduct?: MagnumProduct;
  price: number;
  checked: boolean;
  manualEdit?: boolean;
}

export interface DayMeal {
  day: string;
  dayIndex: number;
  recipe: Recipe;
}

export interface MealPlan {
  id: string;
  createdAt: string;
  budget: BudgetOption;
  customBudget?: number;
  categories: MealCategory[];
  diet: DietType;
  meals: DayMeal[];
  shoppingList: ShoppingItem[];
  totalCost: number;
}

export interface WizardState {
  step: number;
  budget: BudgetOption;
  customBudget: number;
  categories: MealCategory[];
  diet: DietType;
}

export const CATEGORY_LABELS: Record<MealCategory, { label: string; emoji: string; description: string }> = {
  quick: { label: "Быстрые блюда", emoji: "⚡", description: "До 30 минут" },
  "low-cal": { label: "Низкие калории", emoji: "🥗", description: "Лёгкие блюда" },
  "family-favorites": { label: "Любимые семьи", emoji: "❤️", description: "Проверенные рецепты" },
  healthy: { label: "Здоровая пища", emoji: "🌿", description: "Полезно и вкусно" },
  indulge: { label: "Обожраться", emoji: "🍕", description: "Для особых дней" },
  kazakh: { label: "Казахская кухня", emoji: "🇰🇿", description: "Национальные блюда" },
  kids: { label: "Детские блюда", emoji: "👶", description: "Для Данила и Леры" },
};

export const DIET_LABELS: Record<DietType, { label: string; description: string }> = {
  none: { label: "Без ограничений", description: "Любые блюда" },
  vegetarian: { label: "Вегетарианская", description: "Без мяса" },
  "gluten-free": { label: "Без глютена", description: "Без пшеницы" },
  keto: { label: "Кето", description: "Мало углеводов" },
  "low-carb": { label: "Низкоуглеводная", description: "Умеренно мало углеводов" },
};

export const BUDGET_LABELS: Record<BudgetOption, string> = {
  none: "Без бюджета",
  "15000": "15 000 ₸",
  "25000": "25 000 ₸",
  "35000": "35 000 ₸",
  "50000": "50 000 ₸",
  "70000": "70 000 ₸",
  custom: "Своя сумма",
};

export const DAYS_OF_WEEK = [
  "Понедельник",
  "Вторник",
  "Среда",
  "Четверг",
  "Пятница",
  "Суббота",
  "Воскресенье",
];

export const FAMILY = {
  mom: "Олеся",
  dad: "Станислав",
  son1: "Слава",
  son2: "Данил",
  daughter: "Лера",
  size: 5,
  city: "Алматы",
};
