import OpenAI from "openai";
import type {
  MealCategory,
  DietType,
  BudgetOption,
  MealPlan,
  MealType,
  DayMeal,
  Recipe,
  Ingredient,
} from "./types";
import { CATEGORY_LABELS, DAYS_OF_WEEK } from "./types";
import { RECIPES, getRecipeById } from "./recipes";
import { buildShoppingList } from "./meal-planner";
import { generateId } from "./utils";
import {
  getAllowedMagnumSearches,
  resolveMagnumSearch,
} from "./magnum-ingredients";
import {
  getCategoriesForDay,
  normalizeSpecialDays,
} from "./day-categories";

const MEAL_TYPES: MealType[] = ["breakfast", "lunch", "dinner"];

interface AiMealPayload {
  dayIndex: number;
  mealType: MealType;
  useCatalogId?: string | null;
  recipe?: {
    name?: string;
    description?: string;
    prepTime?: number;
    cookTime?: number;
    calories?: number;
    ingredients?: Array<{
      name?: string;
      amount?: string;
      magnumSearch?: string;
    }>;
    steps?: string[];
  };
}

function slugify(name: string): string {
  return (
    "ai-" +
    name
      .toLowerCase()
      .replace(/ё/g, "е")
      .replace(/[^a-zа-я0-9]+/gi, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40) +
    "-" +
    generateId().slice(0, 4)
  );
}

function sanitizeIngredients(
  raw: Array<{ name?: string; amount?: string; magnumSearch?: string }> | undefined
): Ingredient[] {
  if (!raw || raw.length === 0) return [];

  return raw
    .filter((ing) => ing && (ing.name || ing.magnumSearch))
    .map((ing) => ({
      name: (ing.name || ing.magnumSearch || "Продукт").trim(),
      amount: (ing.amount || "по вкусу").trim(),
      magnumSearch: resolveMagnumSearch(
        ing.magnumSearch || ing.name || "молоко"
      ),
    }));
}

function recipeFromAi(
  payload: NonNullable<AiMealPayload["recipe"]>,
  mealType: MealType,
  categories: MealCategory[],
  diet: DietType
): Recipe | null {
  const name = payload.name?.trim();
  if (!name) return null;

  const ingredients = sanitizeIngredients(payload.ingredients);
  if (ingredients.length < 2) return null;

  const steps = (payload.steps ?? [])
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 8);

  return {
    id: slugify(name),
    name,
    description: payload.description?.trim() || name,
    categories: categories.length > 0 ? categories : ["russian"],
    mealTypes: [mealType],
    diets: diet === "none" ? ["none"] : ["none", diet],
    prepTime: Math.max(0, Math.round(payload.prepTime ?? 10)),
    cookTime: Math.max(0, Math.round(payload.cookTime ?? 20)),
    servings: 5,
    calories: Math.max(80, Math.round(payload.calories ?? 320)),
    ingredients,
    steps: steps.length > 0 ? steps : ["Приготовить по домашнему рецепту"],
    tags: categories,
  };
}

function pickFallbackRecipe(
  mealType: MealType,
  categories: MealCategory[],
  excludeCategories: MealCategory[],
  diet: DietType,
  usedIds: Set<string>,
  excludeIds: Set<string>
): Recipe {
  const matchCat = RECIPES.filter((r) => {
    if (!r.mealTypes.includes(mealType)) return false;
    if (diet !== "none" && !r.diets.includes(diet)) return false;
    if (usedIds.has(r.id)) return false;
    if (excludeCategories.some((c) => r.categories.includes(c))) return false;
    if (categories.length > 0 && !categories.some((c) => r.categories.includes(c))) {
      return false;
    }
    return true;
  });

  const unused = matchCat.filter((r) => !excludeIds.has(r.id));
  const pool = unused.length > 0 ? unused : matchCat;

  if (pool.length > 0) {
    return pool[Math.floor(Math.random() * pool.length)];
  }

  const anyType = RECIPES.filter(
    (r) =>
      r.mealTypes.includes(mealType) &&
      !usedIds.has(r.id) &&
      !excludeCategories.some((c) => r.categories.includes(c))
  );
  return anyType[Math.floor(Math.random() * anyType.length)] ?? RECIPES[0];
}

function categoryGuide(categories: MealCategory[]): string {
  if (categories.length === 0) {
    return "Категории не выбраны — составь разнообразное домашнее меню, без повторов.";
  }

  const details: Record<MealCategory, string> = {
    quick:
      "только блюда до 30 минут суммарно, простые, минимум возни",
    "low-cal":
      "лёгкие блюда до ~350 ккал на порцию: овощи, рыба, супы, салаты, без жарки во фритюре и без пельменей/пиццы",
    "family-favorites":
      "сытные семейные блюда, которые любят дети и взрослые",
    healthy:
      "каши, овощи, нежирное мясо/рыба, запекание, меньше майонеза и жарки",
    indulge:
      "сытные уютные блюда: сливочные соусы, жарка, пицца, пельмени, плов — НЕ салаты и НЕ диетические супы",
    russian:
      "традиционная русская домашняя кухня (каши, щи, зразы, котлеты, вареники), но НЕ одно и то же каждую неделю — варьируй",
    kids: "привычные мягкие вкусы для детей: котлеты, макароны, каши, запеканки, без острого и экзотики",
  };

  return categories
    .map((c) => {
      const label = CATEGORY_LABELS[c]?.label ?? c;
      return `- ${label} (${c}): ${details[c]}`;
    })
    .join("\n");
}

export async function generateMealPlanWithAI(
  categories: MealCategory[],
  diet: DietType,
  budget: BudgetOption,
  customBudget?: number,
  excludeIds: string[] = [],
  excludeNames: string[] = [],
  specialDays: number[] = []
): Promise<MealPlan | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  try {
    const openai = new OpenAI({ apiKey });
    const allowedSearches = getAllowedMagnumSearches();
    const excludeSet = new Set(excludeIds);

    const days = normalizeSpecialDays(categories, specialDays);
    const specialDayNames = days.map((d) => DAYS_OF_WEEK[d]).join(", ");
    const hasIndulge = categories.includes("indulge");

    const catalog = RECIPES.filter(
      (r) =>
        !excludeSet.has(r.id) &&
        (diet === "none" || r.diets.includes(diet as (typeof r.diets)[number]))
    ).map((r) => ({
      id: r.id,
      name: r.name,
      categories: r.categories,
      mealTypes: r.mealTypes,
    }));

    const categoryText =
      categories.length > 0
        ? categories
            .map((c) => CATEGORY_LABELS[c]?.label ?? c)
            .join(", ")
        : "любые домашние";

    const budgetText =
      budget === "none"
        ? "без ограничений"
        : budget === "custom"
          ? `${customBudget} тенге`
          : `${budget} тенге`;

    const varietyToken = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    const prompt = `Составь НОВОЕ меню на 7 дней для русской семьи из 5 человек в Алматы (Олеся, Станислав, Слава, Данил, Лера). Квартира, плита и духовка, БЕЗ гриля и шашлыка.

Выбранные категории: ${categoryText}
${
  hasIndulge
    ? `«Обожраться» ТОЛЬКО в эти дни: ${specialDayNames} (dayIndex ${days.join(", ")}). В остальные дни НЕ ставь пиццу, плов, бефстроганов, пельмени и прочие тяжёлые блюда.`
    : "Категории действуют всю неделю."
}

Как готовить под категории:
${categoryGuide(categories.filter((c) => c !== "indulge" || hasIndulge))}

Диета: ${diet === "none" ? "без ограничений" : diet}
Бюджет на неделю: ${budgetText}
Код разнообразия (не повторяй прошлые меню): ${varietyToken}

Жёсткие правила:
1. 21 блюдо: 7 дней × breakfast, lunch, dinner.
2. На обычных днях блюда должны соответствовать категориям без «обожраться». На особых днях — сытные «обожраться».
3. ПРИДУМАЙ оригинальные домашние рецепты. Не копируй одно и то же каждую неделю.
4. Можно взять из каталога не больше 7 блюд из 21, и только если они идеально подходят. Остальные — новые.
5. Не повторяй название блюда в течение недели (завтраки тоже желательно разные).
6. Не используй эти недавние блюда: ${excludeNames.slice(0, 30).join(", ") || "—"}
7. magnumSearch ингредиента — СТРОГО одно значение из списка: ${allowedSearches.join(", ")}
8. Порции в ингредиентах — на 5 человек.
9. Только валидный JSON.

Каталог (можно брать id в useCatalogId, если подходит):
${JSON.stringify(catalog)}

Формат:
{"meals":[{"dayIndex":0,"mealType":"breakfast","useCatalogId":null,"recipe":{"name":"...","description":"...","prepTime":10,"cookTime":15,"calories":300,"ingredients":[{"name":"Творог","amount":"500 г","magnumSearch":"творог"}],"steps":["...","..."]}}]}

Если берёшь из каталога: {"dayIndex":0,"mealType":"breakfast","useCatalogId":"syrniki"} без recipe.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Ты шеф домашней русской кухни. Меню сильно зависит от выбранных категорий и каждый раз разное. Ответ — только JSON с 21 элементом meals.",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 1.05,
      max_tokens: 7000,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) return null;

    const parsed = JSON.parse(content) as { meals?: AiMealPayload[] };
    const payloads = parsed.meals ?? [];

    const meals: DayMeal[] = [];
    const usedIds = new Set<string>();
    const usedNames = new Set<string>();

    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
      const dayCats = getCategoriesForDay(categories, days, dayIndex);
      for (const mealType of MEAL_TYPES) {
        const pick = payloads.find(
          (s) =>
            Number(s.dayIndex) === dayIndex && s.mealType === mealType
        );

        let recipe: Recipe | null = null;

        if (pick?.useCatalogId) {
          const catalogRecipe = getRecipeById(pick.useCatalogId);
          const excluded = dayCats.exclude.some((c) =>
            catalogRecipe?.categories.includes(c)
          );
          if (
            catalogRecipe &&
            catalogRecipe.mealTypes.includes(mealType) &&
            !usedIds.has(catalogRecipe.id) &&
            !excludeSet.has(catalogRecipe.id) &&
            !excluded
          ) {
            recipe = catalogRecipe;
          }
        }

        if (!recipe && pick?.recipe) {
          const generated = recipeFromAi(
            pick.recipe,
            mealType,
            dayCats.categories,
            diet
          );
          if (
            generated &&
            !usedNames.has(generated.name.toLowerCase())
          ) {
            recipe = generated;
          }
        }

        if (!recipe) {
          recipe = pickFallbackRecipe(
            mealType,
            dayCats.categories,
            dayCats.exclude,
            diet,
            usedIds,
            excludeSet
          );
        }

        usedIds.add(recipe.id);
        usedNames.add(recipe.name.toLowerCase());

        meals.push({
          day: DAYS_OF_WEEK[dayIndex],
          dayIndex,
          mealType,
          recipe,
        });
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
      specialDays: days,
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
