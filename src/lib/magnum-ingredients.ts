export interface IngredientSearchConfig {
  /** Search queries tried in order against Magnum API */
  queries: string[];
  /** Product name must contain at least one (case-insensitive) */
  required?: string[];
  /** Product name must not contain any of these */
  exclude?: string[];
  /** Prefer products whose name starts with this prefix */
  preferPrefix?: string;
  /** Estimated price in ₸ when Magnum API has no matching product */
  estimatedPrice: number;
  /** Human-readable label for fallback product name */
  displayName?: string;
}

/**
 * Maps recipe `magnumSearch` keys to Magnum API queries and relevance rules.
 * Fresh produce is often absent from the online catalog — we use estimated Almaty prices then.
 */
export const INGREDIENT_SEARCH: Record<string, IngredientSearchConfig> = {
  сметана: {
    queries: ["СМЕТАНА", "сметана"],
    required: ["СМЕТАН"],
    estimatedPrice: 469,
    displayName: "Сметана 20% 200 г",
  },
  молоко: {
    queries: ["МОЛОКО", "молоко"],
    required: ["МОЛОК"],
    exclude: ["КОКОС", "МИНДАЛ", "ОВСЯН"],
    estimatedPrice: 649,
    displayName: "Молоко 3.2% 900 мл",
  },
  творог: {
    queries: ["ТВОРОГ", "творог"],
    required: ["ТВОРОГ"],
    estimatedPrice: 549,
    displayName: "Творог 5% 300 г",
  },
  яйца: {
    queries: ["ЯЙЦО", "яйца"],
    required: ["ЯЙЦ"],
    exclude: ["ЯЙЦОК", "ПАСХАЛ"],
    estimatedPrice: 779,
    displayName: "Яйца отборные 10 шт",
  },
  мука: {
    queries: ["МУКА", "мука"],
    required: ["МУК"],
    exclude: ["КУКУРУЗ"],
    estimatedPrice: 525,
    displayName: "Мука пшеничная 1 кг",
  },
  сахар: {
    queries: ["САХАР «", "САХАР П", "САХАР М", "сахар"],
    required: ["САХАР «", "САХАР П", "САХАР М", "САХАР Г"],
    exclude: ["САХАРН", "КУКУРУЗ", "БЕЗ САХ", "СОК "],
    estimatedPrice: 449,
    displayName: "Сахар 1 кг",
  },
  "масло растительное": {
    queries: ["МАСЛО РАС", "МАСЛО ПОДС", "масло растительное"],
    required: ["МАСЛО"],
    exclude: ["СЛИВОЧ", "ОЛИВ", "КУНЖУТ"],
    estimatedPrice: 899,
    displayName: "Масло подсолнечное 1 л",
  },
  "масло сливочное": {
    queries: ["МАСЛО СЛ", "масло сливочное"],
    required: ["МАСЛО"],
    exclude: ["РАСТ", "ОЛИВ", "ПОДС"],
    estimatedPrice: 899,
    displayName: "Масло сливочное 200 г",
  },
  сыр: {
    queries: ["СЫР «", "сыр"],
    required: ["СЫР «", "СЫР\""],
    exclude: ["СЫРОМ", "С СЫР", "ТВОРОЖ"],
    estimatedPrice: 1299,
    displayName: "Сыр твёрдый 200 г",
  },
  соль: {
    queries: ["СОЛЬ «", "СОЛЬ М", "соль"],
    required: ["СОЛЬ"],
    exclude: ["ФАСОЛ", "ПОЛУК"],
    estimatedPrice: 199,
    displayName: "Соль 1 кг",
  },
  манка: {
    queries: ["МАННАЯ", "МАНКА", "манка"],
    required: ["МАН"],
    estimatedPrice: 399,
    displayName: "Манная крупа 800 г",
  },
  изюм: {
    queries: ["ИЗЮМ", "изюм"],
    required: ["ИЗЮМ"],
    estimatedPrice: 899,
    displayName: "Изюм 200 г",
  },
  гречка: {
    queries: ["ГРЕЧН", "гречка"],
    required: ["ГРЕЧ"],
    estimatedPrice: 675,
    displayName: "Гречка 800 г",
  },
  говядина: {
    queries: ["ГОВЯД", "говядина"],
    required: ["ГОВЯД"],
    exclude: ["БУЛЬОН", "КОНСЕРВ", "СУП"],
    estimatedPrice: 3499,
    displayName: "Говядина ~500 г",
  },
  свекла: {
    queries: ["СВЕКЛ", "свекла"],
    required: ["СВЕКЛ"],
    estimatedPrice: 299,
    displayName: "Свёкла свежая ~1 кг",
  },
  капуста: {
    queries: ["КАПУСТ", "капуста"],
    required: ["КАПУСТ"],
    estimatedPrice: 349,
    displayName: "Капуста белокочанная",
  },
  картофель: {
    queries: ["КАРТОФЕЛЬ", "КАРТОФ С", "картофель"],
    required: ["КАРТОФ"],
    exclude: ["ВАРЕНИК", "ПЮРЕ", "ЧИПС", "КРУП"],
    estimatedPrice: 399,
    displayName: "Картофель свежий ~1 кг",
  },
  морковь: {
    queries: ["МОРКОВ", "морковь"],
    required: ["МОРКОВ"],
    exclude: ["СОК", "КОНСЕРВ"],
    estimatedPrice: 299,
    displayName: "Морковь свежая ~1 кг",
  },
  лук: {
    queries: ["ЛУК Р", "ЛУК РЕП", "лук"],
    required: ["ЛУК"],
    exclude: ["КОЛБАС", "ПОЛУК", "ЗЕЛЁН", "ЗЕЛЕН", "ПОРЕЙ"],
    estimatedPrice: 249,
    displayName: "Лук репчатый ~1 кг",
  },
  "томатная паста": {
    queries: ["ПАСТА ТОМАТ", "ТОМАТНАЯ ПАСТ", "томатная паста"],
    required: ["ПАСТ", "ТОМАТ"],
    estimatedPrice: 455,
    displayName: "Томатная паста 198 г",
  },
  курица: {
    queries: ["КУРИН ГР", "КУРИЦ", "курица"],
    required: ["КУРИ"],
    exclude: ["СНЕК", "ЧЕБУР", "КРУАС", "НАГГЕТ", "СУП"],
    estimatedPrice: 1899,
    displayName: "Курица ~800 г",
  },
  "куриное филе": {
    queries: ["КУРИН ФИЛ", "ФИЛЕ КУР", "куриное филе"],
    required: ["ФИЛ", "КУР"],
    exclude: ["СНЕК", "НАГГЕТ"],
    estimatedPrice: 2199,
    displayName: "Куриное филе ~800 г",
  },
  лапша: {
    queries: ["ЛАПША", "лапша"],
    required: ["ЛАПШ"],
    estimatedPrice: 199,
    displayName: "Лапша 100 г",
  },
  укроп: {
    queries: ["УКРОП", "укроп"],
    required: ["УКРОП"],
    estimatedPrice: 299,
    displayName: "Укроп свежий",
  },
  перловка: {
    queries: ["ПЕРЛОВ", "перловка"],
    required: ["ПЕРЛОВ"],
    estimatedPrice: 399,
    displayName: "Перловка 800 г",
  },
  "огурцы маринованные": {
    queries: ["ОГУРЦ", "огурцы маринованные"],
    required: ["ОГУР"],
    estimatedPrice: 899,
    displayName: "Огурцы маринованные 720 мл",
  },
  колбаса: {
    queries: ["КОЛБАС", "колбаса"],
    required: ["КОЛБАС"],
    estimatedPrice: 999,
    displayName: "Колбаса варёная 400 г",
  },
  ветчина: {
    queries: ["ВЕТЧИН", "ветчина"],
    required: ["ВЕТЧИН"],
    estimatedPrice: 1499,
    displayName: "Ветчина 300 г",
  },
  маслины: {
    queries: ["МАСЛИН", "маслины"],
    required: ["МАСЛИН"],
    estimatedPrice: 899,
    displayName: "Маслины 300 г",
  },
  лимон: {
    queries: ["ЛИМОН «", "ЛИМОН СВ", "лимон"],
    required: ["ЛИМОН"],
    exclude: ["ЛИМОНАД", "НАПИТ"],
    estimatedPrice: 399,
    displayName: "Лимон свежий",
  },
  помидоры: {
    queries: ["ПОМИДОР", "ТОМАТ С", "помидоры"],
    required: ["ПОМИДОР", "ТОМАТ"],
    exclude: ["ПАСТ", "СОК", "КЕТЧУП"],
    estimatedPrice: 899,
    displayName: "Помидоры свежие ~1 кг",
  },
  огурцы: {
    queries: ["ОГУРЕЦ С", "ОГУРЦ С", "огурцы"],
    required: ["ОГУР"],
    exclude: ["МАРИН", "КОНСЕРВ"],
    estimatedPrice: 699,
    displayName: "Огурцы свежие ~1 кг",
  },
  "перец болгарский": {
    queries: ["ПЕРЕЦ Б", "перец болгарский"],
    required: ["ПЕРЕЦ"],
    exclude: ["ЧЁРН", "ЧЕРН", "КРАСН МОЛ"],
    estimatedPrice: 799,
    displayName: "Перец болгарский",
  },
  фета: {
    queries: ["ФЕТА", "фета"],
    required: ["ФЕТ"],
    estimatedPrice: 1515,
    displayName: "Сыр фета 200 г",
  },
  "оливковое масло": {
    queries: ["ОЛИВК", "оливковое масло"],
    required: ["ОЛИВ"],
    estimatedPrice: 2499,
    displayName: "Масло оливковое 500 мл",
  },
  салат: {
    queries: ["САЛАТ А", "АЙСБЕРГ", "салат"],
    required: ["САЛАТ", "АЙСБ"],
    exclude: ["СМЕСЬ", "ЗАПРАВ"],
    estimatedPrice: 599,
    displayName: "Салат листовой",
  },
  сухари: {
    queries: ["СУХАР", "ГАЛЕТ", "сухари"],
    required: ["СУХАР", "ГАЛЕТ"],
    estimatedPrice: 449,
    displayName: "Сухари панировочные 250 г",
  },
  parmesan: {
    queries: ["PARMESAN", "ПАРМЕЗ", "parmesan"],
    required: ["PARM", "ПАРМЕЗ"],
    estimatedPrice: 1899,
    displayName: "Parmesan 100 г",
  },
  майонез: {
    queries: ["МАЙОНЕЗ", "майонез"],
    required: ["МАЙОН"],
    estimatedPrice: 349,
    displayName: "Майонез 190 г",
  },
  горошек: {
    queries: ["ГОРОШЕК", "горошек"],
    required: ["ГОРОШ"],
    estimatedPrice: 549,
    displayName: "Горошек консервированный 400 г",
  },
  пельмени: {
    queries: ["ПЕЛЬМЕН", "пельмени"],
    required: ["ПЕЛЬМ"],
    estimatedPrice: 1159,
    displayName: "Пельмени 400 г",
  },
  макароны: {
    queries: ["МАКАРОН", "макароны"],
    required: ["МАКАР"],
    estimatedPrice: 499,
    displayName: "Макароны 400 г",
  },
  рис: {
    queries: ["РИС «", "РИС ", "рис"],
    required: ["РИС"],
    exclude: ["КРУП", "ЛАПШ", "ХЛЕБ"],
    estimatedPrice: 899,
    displayName: "Рис 900 г",
  },
  чеснок: {
    queries: ["ЧЕСНОК", "чеснок"],
    required: ["ЧЕСН"],
    estimatedPrice: 399,
    displayName: "Чеснок свежий",
  },
  зира: {
    queries: ["ЗИРА", "зира"],
    required: ["ЗИР"],
    estimatedPrice: 299,
    displayName: "Зира 50 г",
  },
  "говяжий фарш": {
    queries: ["ФАРШ ГОВ", "говяжий фарш"],
    required: ["ФАРШ", "ГОВ"],
    estimatedPrice: 1599,
    displayName: "Фарш говяжий 500 г",
  },
  "свиной фарш": {
    queries: ["ФАРШ СВИН", "свиной фарш"],
    required: ["ФАРШ", "СВИН"],
    estimatedPrice: 1399,
    displayName: "Фарш свиной 500 г",
  },
  "куриный фарш": {
    queries: ["ФАРШ КУР", "куриный фарш"],
    required: ["ФАРШ", "КУР"],
    estimatedPrice: 1299,
    displayName: "Фарш куриный 500 г",
  },
  спагетти: {
    queries: ["СПАГЕТТ", "спагетти"],
    required: ["СПАГЕТ"],
    estimatedPrice: 499,
    displayName: "Спагетти 500 г",
  },
  бекон: {
    queries: ["БЕКОН", "бекон"],
    required: ["БЕКОН"],
    exclude: ["САРДЕЛ"],
    estimatedPrice: 1899,
    displayName: "Бекон 200 г",
  },
  судак: {
    queries: ["СУДАК", "судак"],
    required: ["СУДАК", "РЫБ"],
    estimatedPrice: 3999,
    displayName: "Филе судака ~800 г",
  },
  кабачки: {
    queries: ["КАБАЧ", "кабачки"],
    required: ["КАБАЧ"],
    estimatedPrice: 399,
    displayName: "Кабачки свежие",
  },
  баклажаны: {
    queries: ["БАКЛАЖ", "баклажаны"],
    required: ["БАКЛАЖ"],
    estimatedPrice: 599,
    displayName: "Баклажаны свежие",
  },
  шампиньоны: {
    queries: ["ШАМПИН", "шампиньоны"],
    required: ["ШАМПИН", "ГРИБ"],
    estimatedPrice: 899,
    displayName: "Шампиньоны 400 г",
  },
  свинина: {
    queries: ["СВИН", "свинина"],
    required: ["СВИН"],
    exclude: ["ФАРШ", "КОЛБАС", "БЕКОН"],
    estimatedPrice: 2799,
    displayName: "Свинина ~800 г",
  },
};

export function getIngredientConfig(searchTerm: string): IngredientSearchConfig {
  const key = searchTerm.toLowerCase().trim();
  return (
    INGREDIENT_SEARCH[key] ?? {
      queries: [searchTerm, searchTerm.toUpperCase()],
      estimatedPrice: 499,
      displayName: searchTerm,
    }
  );
}
