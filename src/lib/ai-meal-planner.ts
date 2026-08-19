import OpenAI from "openai";
import type {
  MealCategory,
  DietType,
  BudgetOption,
  MealPlan,
  MealType,
  DayMeal,
} from "./types";
import { DAYS_OF_WEEK, MEAL_TYPE_LABELS } from "./types";
import { RECIPES, getRecipeById } from "./recipes";
import { buildShoppingList } from "./meal-planner";
import { generateId } from "./utils";

const MEAL_TYPES: MealType[] = ["breakfast", "lunch", "dinner"];

interface AiSelection {
  dayIndex: number;
  mealType: MealType;
  recipeId: string;
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

    const catalog = RECIPES.map((r) => ({
      id: r.id,
      name: r.name,
      categories: r.categories,
      mealTypes: r.mealTypes,
      calories: r.calories,
      familyFavorite: r.familyFavorite ?? false,
    }));

    const categoryText =
      categories.length > 0
        ? categories.join(", ")
        : "любые подходящие";

    const budgetText =
      budget === "none"
        ? "без ограничений"
        : budget === "custom"
          ? `${customBudget} тенге на неделю`
          : `${budget} тенге на неделю`;

    const prompt = `Ты — помощник для русской семьи из 5 человек в Алматы (мама Олеся, папа Станислав, сыновья Слава и Данил, дочка Лера).
Они живут в квартире без гриля. Подбери меню на 7 дней: завтрак, обед и ужин каждый день (21 блюдо).

Условия:
- Категории: ${categoryText}
- Диета: ${diet === "none" ? "без ограничений" : diet}
- Бюджет: ${budgetText}
- Используй ТОЛЬКО recipeId из каталога ниже
- Каждый recipeId — максимум 1 раз за неделю
- recipeId должен подходить по mealTypes (breakfast/lunch/dinner)
- Разнообразие важнее повторов
- Предпочитай familyFavorite где уместно

Каталог рецептов:
${JSON.stringify(catalog)}

Верни JSON:
{
  "selections": [
    { "dayIndex": 0, "mealType": "breakfast", "recipeId": "syrniki" },
    ...
  ]
}

dayIndex: 0=Понедельник ... 6=Воскресенье
mealType: breakfast | lunch | dinner
Нужно ровно 21 элемент (7 дней × 3 приёма пищи).`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Ты эксперт по домашней русской кухне. Отвечай только валидным JSON.",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) return null;

    const parsed = JSON.parse(content) as { selections?: AiSelection[] };
    if (!parsed.selections?.length) return null;

    const meals: DayMeal[] = [];
    const usedIds = new Set<string>();

    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
      for (const mealType of MEAL_TYPES) {
        const pick = parsed.selections.find(
          (s) => s.dayIndex === dayIndex && s.mealType === mealType
        );

        let recipe = pick ? getRecipeById(pick.recipeId) : undefined;

        if (
          !recipe ||
          !recipe.mealTypes.includes(mealType) ||
          usedIds.has(recipe.id)
        ) {
          recipe = RECIPES.find(
            (r) =>
              r.mealTypes.includes(mealType) &&
              !usedIds.has(r.id) &&
              (categories.length === 0 ||
                categories.some((c) => r.categories.includes(c)))
          );
        }

        if (!recipe) {
          recipe = RECIPES.find(
            (r) => r.mealTypes.includes(mealType) && !usedIds.has(r.id)
          );
        }

        if (!recipe) continue;

        meals.push({
          day: DAYS_OF_WEEK[dayIndex],
          dayIndex,
          mealType,
          recipe,
        });
        usedIds.add(recipe.id);
      }
    }

    if (meals.length < 21) return null;

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

export function getAiStatusLabel(): string {
  return process.env.OPENAI_API_KEY
    ? "ИИ подбирает блюда для семьи..."
    : "Подбираем блюда...";
}
