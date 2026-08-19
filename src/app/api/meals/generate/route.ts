import { NextRequest, NextResponse } from "next/server";
import { generateMealPlan } from "@/lib/meal-planner";
import { generateMealPlanWithAI } from "@/lib/ai-meal-planner";
import { RECIPES } from "@/lib/recipes";
import type { MealCategory, BudgetOption } from "@/lib/types";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      categories = [],
      budget = "none",
      customBudget,
      excludeRecipeIds = [],
      excludeRecipeNames = [],
      specialDays = [],
      likedRecipeIds = [],
      dislikedRecipeIds = [],
    } = body as {
      categories: MealCategory[];
      budget: BudgetOption;
      customBudget?: number;
      excludeRecipeIds?: string[];
      excludeRecipeNames?: string[];
      specialDays?: number[];
      likedRecipeIds?: string[];
      dislikedRecipeIds?: string[];
    };

    const likedNames = likedRecipeIds
      .map((id) => RECIPES.find((r) => r.id === id)?.name ?? id)
      .filter(Boolean);

    if (process.env.OPENAI_API_KEY) {
      const aiPlan = await generateMealPlanWithAI(
        categories,
        "none",
        budget,
        customBudget,
        excludeRecipeIds,
        excludeRecipeNames,
        specialDays,
        likedNames
      );
      if (aiPlan) {
        return NextResponse.json({ plan: aiPlan, source: "ai" });
      }
    }

    const plan = await generateMealPlan(
      categories,
      "none",
      budget,
      customBudget,
      excludeRecipeIds,
      specialDays,
      likedRecipeIds,
      dislikedRecipeIds
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
