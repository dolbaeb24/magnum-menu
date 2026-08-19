export type MealCategory =
  | "quick"
  | "low-cal"
  | "family-favorites"
  | "healthy"
  | "indulge"
  | "russian"
  | "kids";

export type MealType = "breakfast" | "lunch" | "dinner";

export type DietType =
  | "none"
  | "vegetarian"
  | "gluten-free"
  | "keto"
  | "low-carb";

export type BudgetOption =
  | "none"
  | "45000"
  | "75000"
  | "105000"
  | "150000"
  | "210000"
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
  mealTypes: MealType[];
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
  estimated?: boolean;
}

export interface ShoppingItem {
  id: string;
  ingredientName: string;
  amount: string;
  magnumSearch?: string;
  magnumProduct?: MagnumProduct;
  price: number;
  checked: boolean;
  manualEdit?: boolean;
}

export interface DayMeal {
  day: string;
  dayIndex: number;
  mealType: MealType;
  recipe: Recipe;
  estimatedCost?: number;
}

export interface MealPlan {
  id: string;
  createdAt: string;
  budget: BudgetOption;
  customBudget?: number;
  categories: MealCategory[];
  specialDays: number[];
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
  specialDays: number[];
  diet: DietType;
}

export const MEAL_TYPE_LABELS: Record<
  MealType,
  { label: string; emoji: string; time: string }
> = {
  breakfast: { label: "Завтрак", emoji: "🌅", time: "08:00" },
  lunch: { label: "Обед", emoji: "☀️", time: "13:00" },
  dinner: { label: "Ужин", emoji: "🌙", time: "19:00" },
};

export const CATEGORY_LABELS: Record<
  MealCategory,
  { label: string; emoji: string; description: string }
> = {
  quick: { label: "Быстрые блюда", emoji: "⚡", description: "До 30 минут" },
  "low-cal": { label: "Низкие калории", emoji: "🥗", description: "Лёгкие блюда" },
  "family-favorites": {
    label: "Любимые семьи",
    emoji: "❤️",
    description: "Проверенные рецепты",
  },
  healthy: { label: "Здоровая пища", emoji: "🌿", description: "Полезно и вкусно" },
  indulge: { label: "Обожраться", emoji: "🍕", description: "Только в выбранные дни" },
  russian: {
    label: "Русская кухня",
    emoji: "🥟",
    description: "Домашние рецепты",
  },
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
  "45000": "45 000 ₸",
  "75000": "75 000 ₸",
  "105000": "105 000 ₸",
  "150000": "150 000 ₸",
  "210000": "210 000 ₸",
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

export const DAYS_SHORT = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

export const FAMILY = {
  mom: "Олеся",
  dad: "Станислав",
  son1: "Слава",
  son2: "Данил",
  daughter: "Лера",
  size: 5,
  city: "Алматы",
};

export const FAMILY_MEMBERS = [
  { id: "olesya", name: "Олеся", role: "мама", emoji: "👩" },
  { id: "stanislav", name: "Станислав", role: "папа", emoji: "👨" },
  { id: "slava", name: "Слава", role: "сын", emoji: "👦" },
  { id: "danil", name: "Данил", role: "сын", emoji: "👦" },
  { id: "lera", name: "Лера", role: "дочь", emoji: "👧" },
] as const;

export type FamilyMemberId = (typeof FAMILY_MEMBERS)[number]["id"];

export interface MemberTastes {
  liked: string[];
  disliked: string[];
}

export interface PlanHistoryItem {
  id: string;
  createdAt: string;
  totalCost: number;
  categories: MealCategory[];
  meals: Array<{
    day: string;
    dayIndex: number;
    mealType: MealType;
    recipeName: string;
    estimatedCost?: number;
  }>;
}
