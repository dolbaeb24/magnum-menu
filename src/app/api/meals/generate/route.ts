import { NextRequest, NextResponse } from "next/server";
import { generateMealPlan } from "@/lib/meal-planner";
import type { MealCategory, DietType, BudgetOption } from "@/lib/types";
import OpenAI from "openai";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      categories = [],
      diet = "none",
      budget = "none",
      customBudget,
      useAI = false,
    } = body as {
      categories: MealCategory[];
      diet: DietType;
      budget: BudgetOption;
      customBudget?: number;
      useAI?: boolean;
    };

    if (useAI && process.env.OPENAI_API_KEY) {
      const aiPlan = await generateWithAI(categories, diet, budget, customBudget);
      if (aiPlan) {
        return NextResponse.json({ plan: aiPlan, source: "ai" });
      }
    }

    const plan = await generateMealPlan(categories, diet, budget, customBudget);
    return NextResponse.json({ plan, source: "local" });
  } catch (error) {
    console.error("Meal generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate meal plan" },
      { status: 500 }
    );
  }
}

async function generateWithAI(
  categories: MealCategory[],
  diet: DietType,
  budget: BudgetOption,
  customBudget?: number
) {
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const prompt = `Ты — помощник для семьи из 5 человек в Алматы (мама Олеся, папа Станислав, сыновья Слава и Данил, дочка Лера).
Подбери 7 ужинов на неделю с учётом:
- Категории: ${categories.join(", ") || "любые"}
- Диета: ${diet === "none" ? "без ограничений" : diet}
- Бюджет: ${budget === "none" ? "без ограничений" : budget === "custom" ? customBudget + " тенге" : budget + " тенге"}

Верни JSON массив из 7 объектов с полями: day (день недели на русском), name (название блюда), description (краткое описание).
Только JSON, без markdown.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) return null;

    JSON.parse(content);
    return null;
  } catch {
    return null;
  }
}
