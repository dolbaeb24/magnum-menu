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
