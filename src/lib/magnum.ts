import type { MagnumProduct } from "./types";

const MAGNUM_API = "https://magnum.kz:1337/api";

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

export async function searchMagnumProducts(
  query: string,
  limit = 5
): Promise<MagnumProduct[]> {
  try {
    const params = new URLSearchParams();
    params.append("filters[name][$containsi]", query);
    params.append("pagination[pageSize]", String(limit));
    params.append("sort", "final_price:asc");

    const response = await fetch(`${MAGNUM_API}/products?${params}`, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return getFallbackProducts(query);
    }

    const data: MagnumApiResponse = await response.json();

    return data.data.map((item) => ({
      id: item.id,
      name: item.attributes.name,
      startPrice: item.attributes.start_price,
      finalPrice: item.attributes.final_price,
      discount: item.attributes.discount,
    }));
  } catch {
    return getFallbackProducts(query);
  }
}

const FALLBACK_PRICES: Record<string, number> = {
  курица: 1899,
  говядина: 3499,
  баранина: 4299,
  свинина: 2799,
  фарш: 1599,
  молоко: 649,
  яйца: 899,
  мука: 499,
  рис: 699,
  макароны: 499,
  картофель: 399,
  морковь: 299,
  лук: 199,
  помидоры: 899,
  огурцы: 699,
  сыр: 1299,
  творог: 799,
  сметана: 599,
  масло: 899,
  сахар: 449,
  соль: 99,
  default: 599,
};

function getFallbackProducts(query: string): MagnumProduct[] {
  const lowerQuery = query.toLowerCase();
  let price = FALLBACK_PRICES.default;

  for (const [key, value] of Object.entries(FALLBACK_PRICES)) {
    if (lowerQuery.includes(key)) {
      price = value;
      break;
    }
  }

  return [
    {
      id: Math.floor(Math.random() * 100000),
      name: query.toUpperCase(),
      startPrice: Math.round(price * 1.1),
      finalPrice: price,
      discount: 0.1,
    },
  ];
}

export async function findBestProduct(
  searchTerm: string
): Promise<MagnumProduct | null> {
  const products = await searchMagnumProducts(searchTerm, 3);
  return products[0] ?? null;
}
