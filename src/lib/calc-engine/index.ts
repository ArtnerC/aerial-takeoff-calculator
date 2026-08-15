import {
  applyCompaction,
  applyWaste,
  ceilToIncrement,
  cubicYardsToTons,
  defaultWastePercentFor,
  rawCubicYards,
  roundTo,
} from "./math";
import type { EstimateInput, EstimateResult, EstimateStep } from "./types";

/**
 * Computes a full material estimate and the human-readable steps behind it.
 * Showing the math is the trust mechanism for a customer who has never
 * ordered bulk material before — see SPEC.md §6.
 */
export function calculateEstimate(input: EstimateInput): EstimateResult {
  const { areaSqFt, depthInches, product, source } = input;

  if (depthInches < product.minDepthInches || depthInches > product.maxDepthInches) {
    throw new RangeError(
      `${product.name} supports depths between ${product.minDepthInches}" and ${product.maxDepthInches}"`
    );
  }

  const wastePercent = input.wastePercent ?? defaultWastePercentFor(source);
  const raw = rawCubicYards(areaSqFt, depthInches);
  const withWaste = applyWaste(raw, wastePercent);
  const compactionApplied = Boolean(input.applyCompaction && product.compactionFactor);
  const withCompaction = applyCompaction(
    withWaste,
    product.compactionFactor,
    compactionApplied
  );
  const cubicYards = ceilToIncrement(withCompaction, product.minIncrementYards);
  const tons = cubicYardsToTons(cubicYards, product.densityTonsPerYard);

  const billedQuantity = product.soldBy === "ton" ? tons : cubicYards;
  const materialPrice = roundTo(billedQuantity * product.pricePerUnit, 2);

  const steps: EstimateStep[] = [
    {
      label: "Area to cover",
      value: `${roundTo(areaSqFt, 1)} sq ft`,
    },
    {
      label: `Volume at ${depthInches}" depth`,
      value: `${roundTo(areaSqFt, 1)} sq ft × (${depthInches}" ÷ 12) ÷ 27 = ${roundTo(raw, 2)} yd³`,
    },
    {
      label: `Waste allowance (${wastePercent}%)`,
      value: `${roundTo(raw, 2)} yd³ × ${(1 + wastePercent / 100).toFixed(2)} = ${roundTo(withWaste, 2)} yd³`,
    },
  ];

  if (compactionApplied && product.compactionFactor) {
    steps.push({
      label: `Compaction factor (×${product.compactionFactor})`,
      value: `${roundTo(withWaste, 2)} yd³ × ${product.compactionFactor} = ${roundTo(withCompaction, 2)} yd³`,
    });
  }

  steps.push(
    {
      label: `Rounded up to ${product.minIncrementYards} yd³ increments`,
      value: `${roundTo(withCompaction, 2)} yd³ → ${cubicYards} yd³`,
    },
    {
      label: "Estimated weight",
      value: `${cubicYards} yd³ × ${product.densityTonsPerYard} tons/yd³ = ${tons} tons`,
    }
  );

  return {
    areaSqFt: roundTo(areaSqFt, 1),
    depthInches,
    wastePercent,
    rawCubicYards: roundTo(raw, 2),
    cubicYardsWithWaste: roundTo(withWaste, 2),
    compactionApplied,
    cubicYards,
    tons,
    minIncrementYards: product.minIncrementYards,
    materialPrice,
    unitPriced: product.soldBy,
    steps,
  };
}

export * from "./math";
export * from "./types";
