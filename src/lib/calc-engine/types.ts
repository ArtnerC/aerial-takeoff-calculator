/**
 * Core domain types for the takeoff calc engine.
 * This module has zero UI or map dependencies so it can run in the browser,
 * on the server, or inside a future voice/SMS agent unchanged.
 */

export type ProductCategory =
  | "bark_mulch"
  | "topsoil"
  | "aggregate"
  | "natural_stone"
  | "synthetic_turf"
  | "accessory";

export type SoldBy = "cubic_yard" | "ton" | "each" | "pallet";

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: ProductCategory;
  soldBy: SoldBy;
  /** Placeholder pending Ground Control's measured density per product. */
  densityTonsPerYard: number;
  defaultDepthInches: number;
  minDepthInches: number;
  maxDepthInches: number;
  blowable: boolean;
  /** Loose-to-compacted multiplier; only applies to compacted-base products. */
  compactionFactor?: number;
  /** Smallest sellable increment for this product, in cubic yards. */
  minIncrementYards: number;
  /** Placeholder price pending a live WooCommerce catalog feed. */
  pricePerUnit: number;
}

export type AreaSource = "drawn" | "manual";

export interface MeasuredArea {
  id: string;
  label?: string;
  source: AreaSource;
  areaSqFt: number;
}

export interface EstimateInput {
  areaSqFt: number;
  depthInches: number;
  product: Product;
  /** Overrides the source-based default waste percent when provided. */
  wastePercent?: number;
  source: AreaSource;
  /** Whether the compacted-base factor should be applied for this job. */
  applyCompaction?: boolean;
}

export interface EstimateStep {
  label: string;
  value: string;
}

export interface EstimateResult {
  areaSqFt: number;
  depthInches: number;
  wastePercent: number;
  rawCubicYards: number;
  cubicYardsWithWaste: number;
  compactionApplied: boolean;
  cubicYards: number;
  tons: number;
  minIncrementYards: number;
  materialPrice: number;
  unitPriced: SoldBy;
  /** Human-readable breakdown shown to the customer as "show the math". */
  steps: EstimateStep[];
}
