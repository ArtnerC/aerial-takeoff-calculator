/**
 * Pure math helpers behind the takeoff calculator. Every function here is
 * deterministic and side-effect free so it can be unit tested exhaustively
 * and reused by the AI phone agent / contractor portal without a UI.
 */

const SQFT_PER_SQM = 10.7639104167;
const CUBIC_FEET_PER_CUBIC_YARD = 27;
const INCHES_PER_FOOT = 12;

/** Default waste allowance when the area came from a hand-drawn polygon. */
export const DEFAULT_WASTE_PERCENT_DRAWN = 10;
/** Default waste allowance when the area came from typed dimensions. */
export const DEFAULT_WASTE_PERCENT_MANUAL = 5;

export function defaultWastePercentFor(source: "drawn" | "manual"): number {
  return source === "drawn"
    ? DEFAULT_WASTE_PERCENT_DRAWN
    : DEFAULT_WASTE_PERCENT_MANUAL;
}

export function squareMetersToSquareFeet(sqm: number): number {
  return sqm * SQFT_PER_SQM;
}

/** Square feet one cubic yard of material covers at a given depth. */
export function coverageSqFtPerCubicYard(depthInches: number): number {
  if (depthInches <= 0) {
    throw new RangeError("depthInches must be greater than 0");
  }
  return (CUBIC_FEET_PER_CUBIC_YARD * INCHES_PER_FOOT) / depthInches;
}

/** Raw cubic yards needed to cover an area at a given depth, before waste. */
export function rawCubicYards(areaSqFt: number, depthInches: number): number {
  if (areaSqFt < 0) {
    throw new RangeError("areaSqFt must not be negative");
  }
  if (depthInches <= 0) {
    throw new RangeError("depthInches must be greater than 0");
  }
  return (areaSqFt * (depthInches / INCHES_PER_FOOT)) / CUBIC_FEET_PER_CUBIC_YARD;
}

export function applyWaste(cubicYards: number, wastePercent: number): number {
  if (wastePercent < 0) {
    throw new RangeError("wastePercent must not be negative");
  }
  return cubicYards * (1 + wastePercent / 100);
}

export function applyCompaction(
  cubicYards: number,
  compactionFactor: number | undefined,
  shouldApply: boolean
): number {
  if (!shouldApply || !compactionFactor) {
    return cubicYards;
  }
  return cubicYards * compactionFactor;
}

/**
 * Rounds up to the nearest sellable increment. Always rounds up so a
 * customer never receives less material than the takeoff calls for.
 * A small epsilon guards against floating point values like 2.4999999.
 */
export function ceilToIncrement(value: number, increment: number): number {
  if (increment <= 0) {
    return roundTo(value, 2);
  }
  const epsilon = 1e-9;
  const units = Math.ceil(value / increment - epsilon);
  return roundTo(units * increment, 2);
}

export function cubicYardsToTons(
  cubicYards: number,
  densityTonsPerYard: number
): number {
  return roundTo(cubicYards * densityTonsPerYard, 2);
}

export function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}
