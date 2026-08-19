/** Household / non-grocery Magnum hits that must never enter a meal list. */
export const NON_FOOD_TERMS = [
  "ОСВЕЖ",
  "ВОЗДУХА",
  "GLADE",
  "AIR WICK",
  "АРОМАТИЗАТОР",
  "СТИРАЛЬН",
  "ПОРОШОК ДЛЯ СТИР",
  "СРЕДСТВО ДЛЯ",
  "ЧИСТЯЩ",
  "ОТБЕЛИВ",
  "ШАМПУНЬ",
  "ГЕЛЬ ДЛЯ ДУШ",
  "ЗУБН",
  "ПОДГУЗ",
  "ПРОКЛАД",
  "КОРМ ДЛЯ",
  "НАПОЛНИТЕЛЬ",
  "ТУАЛЕТН",
  "МУСОРН",
  "БАТАРЕЙ",
  "ЛАМП",
  "ФОЛЬГА ПИЩЕВАЯ",
  "ПАКЕТ ДЛЯ",
  "ГУБКА",
  "МЫЛО",
  "СВЕЧА",
  "АНТИТАБАК",
  "DOMESTOS",
  "COMET",
  "FAIRY",
  "SORTI",
  "БЫТОВАЯ ХИМИЯ",
  "БЫТОВАЯ",
  "ДЛЯ БЕЛЬЯ",
  "КОНДИЦИОНЕР ДЛЯ",
];

export function isNonFoodProduct(name: string): boolean {
  const n = name.toUpperCase().replace(/Ё/g, "Е");
  return NON_FOOD_TERMS.some((term) => n.includes(term));
}
