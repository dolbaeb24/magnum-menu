/** Scale a recipe amount string from `baseServings` to `targetServings`. */
export function scaleIngredientAmount(
  amount: string,
  baseServings: number,
  targetServings: number
): string {
  if (!amount || baseServings <= 0 || targetServings === baseServings) {
    return amount;
  }

  const trimmed = amount.trim();
  if (/по вкусу/i.test(trimmed) || /не обязательно/i.test(trimmed)) {
    return trimmed;
  }

  const match = trimmed.match(/^(\d+(?:[.,]\d+)?)\s*(.*)$/u);
  if (!match) return trimmed;

  const value = parseFloat(match[1].replace(",", "."));
  if (!Number.isFinite(value)) return trimmed;

  const unit = match[2].trim();
  const ratio = targetServings / baseServings;
  let scaled = value * ratio;
  let outUnit = unit;

  const unitNorm = unit.toLowerCase().replace(/ё/g, "е");

  if (/^(кг|килограмм)/i.test(unitNorm) && scaled < 1) {
    scaled *= 1000;
    outUnit = "г";
  } else if (/^(л|литр)/i.test(unitNorm) && !/^л[а-я]/i.test(unitNorm) && scaled < 1) {
    scaled *= 1000;
    outUnit = "мл";
  }

  const formatted = formatScaledNumber(scaled, outUnit);
  return outUnit ? `${formatted} ${outUnit}` : formatted;
}

function canonicalUnit(unit: string): string {
  const u = unit.toLowerCase().replace(/ё/g, "е").trim();
  if (/^(кг|килограмм)/.test(u)) return "кг";
  if (/^(г|гр|грамм)/.test(u)) return "г";
  if (/^(л|литр)/.test(u) && !/^л[а-я]/.test(u)) return "л";
  if (/^мл/.test(u)) return "мл";
  return unit.trim();
}

function parseAmountParts(
  amount: string
): { value: number; unit: string } | null {
  const trimmed = amount.trim();
  if (!trimmed || /по вкусу/i.test(trimmed)) return null;
  const match = trimmed.match(/^(\d+(?:[.,]\d+)?)\s*(.*)$/u);
  if (!match) return null;
  const value = parseFloat(match[1].replace(",", "."));
  if (!Number.isFinite(value)) return null;
  return { value, unit: canonicalUnit(match[2]) };
}

/** Merge amounts from several recipes for the same shopping item. */
export function combineAmounts(amounts: string[]): string {
  const unique = amounts.map((a) => a.trim()).filter(Boolean);
  if (unique.length === 0) return "по вкусу";
  if (unique.length === 1) return unique[0];

  const tasteOnly = unique.every((a) => /по вкусу/i.test(a));
  if (tasteOnly) return "по вкусу";

  const parsed = unique
    .map(parseAmountParts)
    .filter((p): p is { value: number; unit: string } => p !== null);

  if (parsed.length === 0) return unique[0];

  const grams = parsed.map((p) => {
    if (p.unit === "кг") return { value: p.value * 1000, unit: "г" };
    if (p.unit === "л") return { value: p.value * 1000, unit: "мл" };
    return p;
  });

  const unit = grams[0].unit;
  if (!grams.every((p) => p.unit === unit)) {
    return unique.join(" + ");
  }

  const total = grams.reduce((sum, p) => sum + p.value, 0);
  let value = total;
  let outUnit = unit;
  if (unit === "г" && value >= 1000) {
    value /= 1000;
    outUnit = "кг";
  } else if (unit === "мл" && value >= 1000) {
    value /= 1000;
    outUnit = "л";
  }

  const formatted = formatScaledNumber(value, outUnit);
  return `${formatted} ${outUnit}`;
}

function formatScaledNumber(scaled: number, unit: string): string {
  const unitNorm = unit.toLowerCase();
  const isWeightOrVolume = /^(г|гр|мл)$/i.test(unit) || unitNorm === "г" || unitNorm === "мл";
  const isCount = /^(шт|зубчик|зубчика|зубчиков|кочан|кочана|головка|головки|банка|банки|пучок|пучка)/i.test(
    unitNorm
  );

  let display: number;

  if (isWeightOrVolume) {
    if (scaled < 15) display = Math.max(1, Math.round(scaled));
    else if (scaled < 100) display = Math.round(scaled / 5) * 5;
    else display = Math.round(scaled / 10) * 10;
  } else if (isCount || /ст\.?\s*л/i.test(unit) || /ч\.?\s*л/i.test(unit)) {
    if (scaled < 1) display = Math.round(scaled * 2) / 2 || 0.5;
    else display = Math.round(scaled * 2) / 2;
  } else {
    display = Math.round(scaled * 10) / 10;
  }

  if (Number.isInteger(display)) return String(display);
  return String(display)
    .replace(/\.0$/, "")
    .replace(".", ",");
}
