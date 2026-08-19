import OpenAI from "openai";
import type {
  MealCategory,
  DietType,
  BudgetOption,
  MealPlan,
  MealType,
  DayMeal,
  Recipe,
} from "./types";
import { DAYS_OF_WEEK } from "./types";
import { RECIPES, getRecipeById } from "./recipes";
import { buildShoppingList } from "./meal-planner";
import { generateId } from "./utils";

const MEAL_TYPES: MealType[] = ["breakfast", "lunch", "dinner"];

interface AiSelection {
  dayIndex: number;
  mealType: MealType;
  recipeId: string;
}

function pickFallbackRecipe(
  mealType: MealType,
  categories: MealCategory[],
  usedForType: Set<string>
): Recipe {
  const pool = RECIPES.filter((r) => {
    if (!r.mealTypes.includes(mealType)) return false;
    if (categories.length === 0) return true;
    return categories.some((c) => r.categories.includes(c));
  });

  const unused = pool.filter((r) => !usedForType.has(r.id));
  const candidates = unused.length > 0 ? unused : pool;

  const scored = candidates
    .map((r) => ({
      recipe: r,
      score: (r.familyFavorite ? 5 : 0) + Math.random() * 3,
    }))
    .sort((a, b) => b.score - a.score);

  return scored[0]?.recipe ?? RECIPES[0];
}

export async function generateMealPlanWithAI(
  categories: MealCategory[],
  diet: DietType,
  budget: BudgetOption,
  customBudget?: number
): Promise<MealPlan | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  try {
    const openai = new OpenAI({ apiKey });

    const catalog = RECIPES.filter(
      (r) =>
        diet === "none" ||
        r.diets.includes(diet as (typeof r.diets)[number])
    ).map((r) => ({
      id: r.id,
      name: r.name,
      categories: r.categories,
      mealTypes: r.mealTypes,
      familyFavorite: r.familyFavorite ?? false,
    }));

    const categoryText =
      categories.length > 0 ? categories.join(", ") : "любые подходящие";

    const budgetText =
      budget === "none"
        ? "без ограничений"
        : budget === "custom"
          ? `${customBudget} тенге`
          : `${budget} тенге`;

    const prompt = `Подбери меню на 7 дней для русской семьи из 5 человек в Алматы (Олеся, Станислав, Слава, Данил, Лера). Квартира, без гриля.

Категории: ${categoryText}
Диета: ${diet === "none" ? "без ограничений" : diet}
Бюджет: ${budgetText}

Правила:
- Только recipeId из каталога
- recipeId должен подходить по mealTypes
- Старайся не повторять, но для завтраков повтор допустим (их мало)
- 21 элемент: 7 дней × (breakfast, lunch, dinner)

Каталог:
${JSON.stringify(catalog)}

JSON: {"selections":[{"dayIndex":0,"mealType":"breakfast","recipeId":"syrniki"}, ...]}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Эксперт по русской домашней кухне. Только валидный JSON, 21 selection.",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) return null;

    const parsed = JSON.parse(content) as { selections?: AiSelection[] };
    const selections = parsed.selections ?? [];

    const meals: DayMeal[] = [];
    const usedByType: Record<MealType, Set<string>> = {
      breakfast: new Set(),
      lunch: new Set(),
      dinner: new Set(),
    };

    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
      for (const mealType of MEAL_TYPES) {
        const pick = selections.find(
          (s) => s.dayIndex === dayIndex && s.mealType === mealType
        );

        const used = usedByType[mealType];

        let recipe: Recipe = pick
          ? getRecipeById(pick.recipeId) ??
            pickFallbackRecipe(mealType, categories, used)
          : pickFallbackRecipe(mealType, categories, used);

        if (!recipe.mealTypes.includes(mealType) || used.has(recipe.id)) {
          recipe = pickFallbackRecipe(mealType, categories, used);
        }

        meals.push({
          day: DAYS_OF_WEEK[dayIndex],
          dayIndex,
          mealType,
          recipe,
        });
        used.add(recipe.id);
      }
    }

    const shoppingList = await buildShoppingList(meals.map((m) => m.recipe));
    const totalCost = shoppingList.reduce((sum, item) => sum + item.price, 0);

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
  } catch (error) {
    console.error("AI meal plan error:", error);
    return null;
  }
}
