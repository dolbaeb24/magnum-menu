import type { MagnumProduct } from "./types";
import {
  getIngredientConfig,
  type IngredientSearchConfig,
} from "./magnum-ingredients";

const MAGNUM_API = "https://magnum.kz:1337/api";
const FETCH_TIMEOUT_MS = 12_000;

interface MagnumApiProduct {
  id: number;
  attributes: {
    name: string;
    start_price: number;
    final_price: number;
    discount: number;
  };
}

interface MagnumApiResponse {
  data: MagnumApiProduct[];
}

function normalizeName(name: string): string {
  return name.toUpperCase().replace(/Ё/g, "Е");
}

function scoreProduct(
  product: MagnumProduct,
  config: IngredientSearchConfig
): number {
  const name = normalizeName(product.name);
  let score = 0;

  if (config.required?.length) {
    const hasRequired = config.required.some((term) =>
      name.includes(normalizeName(term))
    );
    if (!hasRequired) return -1;
    score += 20;
  }

  if (config.exclude?.length) {
    for (const term of config.exclude) {
      if (name.includes(normalizeName(term))) return -1;
    }
  }

  if (config.preferPrefix) {
    if (name.startsWith(normalizeName(config.preferPrefix))) score += 15;
  }

  for (const query of config.queries) {
    const q = normalizeName(query);
    if (name.includes(q)) score += 10;
    if (name.startsWith(q)) score += 5;
  }

  // Prefer mid-range prices over suspiciously cheap wrong matches
  if (product.finalPrice >= 50 && product.finalPrice <= 5000) score += 2;

  return score;
}

async function fetchMagnumProducts(
  query: string,
  limit: number
): Promise<MagnumProduct[]> {
  const params = new URLSearchParams();
  params.append("filters[name][$containsi]", query);
  params.append("pagination[pageSize]", String(limit));
  params.append("sort", "final_price:asc");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(`${MAGNUM_API}/products?${params}`, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "User-Agent": "MagnumMenu/1.0 (+https://github.com/dolbaeb24/magnum-menu)",
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) return [];

    const data: MagnumApiResponse = await response.json();
    if (!Array.isArray(data.data)) return [];

    return data.data.map((item) => ({
      id: item.id,
      name: item.attributes.name,
      startPrice: item.attributes.start_price,
      finalPrice: item.attributes.final_price,
      discount: item.attributes.discount,
    }));
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

export async function searchMagnumProducts(
  query: string,
  limit = 5
): Promise<MagnumProduct[]> {
  return fetchMagnumProducts(query, limit);
}

function createEstimatedProduct(
  searchTerm: string,
  config: IngredientSearchConfig
): MagnumProduct {
  const price = config.estimatedPrice;
  const name = (config.displayName ?? searchTerm).toUpperCase();

  return {
    id: -Math.abs(name.split("").reduce((a, c) => a + c.charCodeAt(0), 0)),
    name: `${name} (≈ оценка)`,
    startPrice: price,
    finalPrice: price,
    discount: 0,
  };
}

function pickBestMatch(
  products: MagnumProduct[],
  config: IngredientSearchConfig
): MagnumProduct | null {
  const scored = products
    .map((product) => ({ product, score: scoreProduct(product, config) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.product.finalPrice - b.product.finalPrice;
    });

  return scored[0]?.product ?? null;
}

export async function findBestProduct(
  searchTerm: string
): Promise<MagnumProduct | null> {
  const config = getIngredientConfig(searchTerm);
  const tried = new Set<string>();

  for (const query of config.queries) {
    const normalizedQuery = query.trim();
    if (!normalizedQuery || tried.has(normalizedQuery.toLowerCase())) continue;
    tried.add(normalizedQuery.toLowerCase());

    const products = await fetchMagnumProducts(normalizedQuery, 12);
    const match = pickBestMatch(products, config);
    if (match) return match;
  }

  return createEstimatedProduct(searchTerm, config);
}
