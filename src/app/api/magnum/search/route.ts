import { NextRequest, NextResponse } from "next/server";
import { searchMagnumProducts } from "@/lib/magnum";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q");
  const limit = parseInt(request.nextUrl.searchParams.get("limit") ?? "5", 10);

  if (!query) {
    return NextResponse.json({ error: "Query parameter 'q' is required" }, { status: 400 });
  }

  try {
    const products = await searchMagnumProducts(query, limit);
    return NextResponse.json({ products });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch products from Magnum" },
      { status: 500 }
    );
  }
}
