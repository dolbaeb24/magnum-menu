import type { MagnumProduct } from "./types";
import {
  getIngredientConfig,
  resolveMagnumSearch,
  type IngredientSearchConfig,
} from "./magnum-ingredients";
import { isNonFoodProduct } from "./magnum-filters";

const MAGNUM_API = "https://magnum.kz:1337/api";
const FETCH_TIMEOUT_MS = 4_000;

const GENERIC_TERMS = new Set([
  "свежий",
  "свежие",
  "свежая",
  "свежее",
  "свеж",
  "ягод",
  "зелень",
  "специи",
  "приправа",
  "молотый",
  "молотая",
]);

/** Magnum online catalog rarely has these; skip slow empty searches. */
const SKIP_API = new Set([
  "свекла",
  "картофель",
  "морковь",
  "свинина",
  "курица",
  "куриное филе",
  "говяжий фарш",
  "свиной фарш",
  "куриный фарш",
  "чеснок",
  "капуста",
  "помидоры",
  "салат",
  "сухари",
  "перловка",
  "манка",
  "изюм",
  "шампиньоны",
  "спагетти",
  "судак",
  "кабачки",
  "баклажаны",
  "зира",
  "укроп",
  "сахар",
  "соль",
  "овсянка",
  "яблоки",
  "яблоко",
  "ягоды",
  "ягода",
  "ваниль",
  "корица",
  "зелень",
]);

const productCache = new Map<string, MagnumProduct>();

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
  config: IngredientSearchConfig,
  searchTerm: string
): number {
  const name = normalizeName(product.name);
  if (isNonFoodProduct(product.name)) return -1;

  let score = 0;

  const required = config.required?.length
    ? config.required
    : searchTerm.trim().length >= 4
      ? [searchTerm]
      : [];

  if (required.length) {
    const hasRequired = required.some((term) =>
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
    if (q.length < 4) continue;
    if (name.startsWith(q)) score += 18;
    else if (name.includes(q)) score += 8;
  }

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
    estimated: true,
  };
}

function pickBestMatch(
  products: MagnumProduct[],
  config: IngredientSearchConfig,
  searchTerm: string
): MagnumProduct | null {
  const scored = products
    .map((product) => ({
      product,
      score: scoreProduct(product, config, searchTerm),
    }))
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
  const resolved = resolveMagnumSearch(searchTerm);
  const cacheKey = resolved.toLowerCase().trim();
  const cached = productCache.get(cacheKey);
  if (cached) return cached;

  const config = getIngredientConfig(resolved);

  if (SKIP_API.has(cacheKey) || GENERIC_TERMS.has(cacheKey)) {
    const estimated = createEstimatedProduct(resolved, config);
    productCache.set(cacheKey, estimated);
    return estimated;
  }

  const queries = [
    ...new Set(config.queries.map((q) => q.trim()).filter((q) => q.length >= 4)),
  ].slice(0, 2);

  if (queries.length === 0) {
    const estimated = createEstimatedProduct(resolved, config);
    productCache.set(cacheKey, estimated);
    return estimated;
  }

  const batches = await Promise.all(
    queries.map((query) => fetchMagnumProducts(query, 8))
  );
  const match = pickBestMatch(batches.flat(), config, resolved);
  const product = match ?? createEstimatedProduct(resolved, config);
  productCache.set(cacheKey, product);
  return product;
}

export async function mapPool<T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const index = nextIndex++;
      results[index] = await mapper(items[index]);
    }
  }

  const poolSize = Math.min(concurrency, items.length) || 1;
  await Promise.all(Array.from({ length: poolSize }, () => worker()));
  return results;
}
