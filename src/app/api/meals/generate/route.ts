import { NextRequest, NextResponse } from "next/server";
import { generateMealPlan } from "@/lib/meal-planner";
import { generateMealPlanWithAI } from "@/lib/ai-meal-planner";
import type { MealCategory, DietType, BudgetOption } from "@/lib/types";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      categories = [],
      diet = "none",
      budget = "none",
      customBudget,
      excludeRecipeIds = [],
      excludeRecipeNames = [],
      specialDays = [],
    } = body as {
      categories: MealCategory[];
      diet: DietType;
      budget: BudgetOption;
      customBudget?: number;
      excludeRecipeIds?: string[];
      excludeRecipeNames?: string[];
      specialDays?: number[];
    };

    if (process.env.OPENAI_API_KEY) {
      const aiPlan = await generateMealPlanWithAI(
        categories,
        diet,
        budget,
        customBudget,
        excludeRecipeIds,
        excludeRecipeNames,
        specialDays
      );
      if (aiPlan) {
        return NextResponse.json({ plan: aiPlan, source: "ai" });
      }
    }

    const plan = await generateMealPlan(
      categories,
      diet,
      budget,
      customBudget,
      excludeRecipeIds,
      specialDays
    );
    return NextResponse.json({ plan, source: "local" });
  } catch (error) {
    console.error("Meal generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate meal plan" },
      { status: 500 }
    );
  }
}
