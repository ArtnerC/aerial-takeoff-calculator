import { describe, expect, it } from "vitest";
import { calculateEstimate } from "../index";
import type { Product } from "../types";

const bark: Product = {
  id: "bark-fine-fir",
  sku: "BARK-FF",
  name: "Fine Fir Bark",
  category: "bark_mulch",
  soldBy: "cubic_yard",
  densityTonsPerYard: 0.45,
  defaultDepthInches: 3,
  minDepthInches: 1,
  maxDepthInches: 6,
  blowable: true,
  minIncrementYards: 0.5,
  pricePerUnit: 45,
};

const baseRock: Product = {
  id: "agg-3-4-minus",
  sku: "AGG-34M",
  name: "3/4\" Minus Base Rock",
  category: "aggregate",
  soldBy: "ton",
  densityTonsPerYard: 1.4,
  defaultDepthInches: 4,
  minDepthInches: 2,
  maxDepthInches: 12,
  blowable: false,
  compactionFactor: 1.2,
  minIncrementYards: 0.5,
  pricePerUnit: 60,
};

describe("calculateEstimate", () => {
  it("computes bark mulch for a 500 sq ft bed at 3 inches with drawn waste", () => {
    const result = calculateEstimate({
      areaSqFt: 500,
      depthInches: 3,
      product: bark,
      source: "drawn",
    });

    // raw = 500 * (3/12) / 27 = 4.6296..., +10% waste = 5.0926, rounded up to 5.5
    expect(result.rawCubicYards).toBeCloseTo(4.63, 2);
    expect(result.wastePercent).toBe(10);
    expect(result.cubicYards).toBeCloseTo(5.5, 5);
    expect(result.tons).toBeCloseTo(2.48, 2);
    expect(result.unitPriced).toBe("cubic_yard");
    expect(result.materialPrice).toBeCloseTo(5.5 * 45, 2);
    expect(result.compactionApplied).toBe(false);
  });

  it("uses the manual waste default and applies compaction for base rock", () => {
    const result = calculateEstimate({
      areaSqFt: 200,
      depthInches: 4,
      product: baseRock,
      source: "manual",
      applyCompaction: true,
    });

    expect(result.wastePercent).toBe(5);
    expect(result.compactionApplied).toBe(true);
    // raw = 200 * (4/12) / 27 = 2.4691, +5% = 2.5926, *1.2 compaction = 3.1111, ceil to 0.5 -> 3.5
    expect(result.cubicYards).toBeCloseTo(3.5, 5);
    expect(result.unitPriced).toBe("ton");
    expect(result.materialPrice).toBeCloseTo(result.tons * 60, 2);
  });

  it("lets an explicit wastePercent override the source default", () => {
    const result = calculateEstimate({
      areaSqFt: 324,
      depthInches: 1,
      product: bark,
      source: "drawn",
      wastePercent: 0,
    });

    // Exactly 1 cubic yard raw, no waste, rounded up to 1 (a multiple of 0.5).
    expect(result.rawCubicYards).toBeCloseTo(1, 5);
    expect(result.cubicYards).toBeCloseTo(1, 5);
  });

  it("rejects a depth outside the product's supported range", () => {
    expect(() =>
      calculateEstimate({
        areaSqFt: 100,
        depthInches: 20,
        product: bark,
        source: "drawn",
      })
    ).toThrow(RangeError);
  });

  it("always includes a human-readable breakdown", () => {
    const result = calculateEstimate({
      areaSqFt: 150,
      depthInches: 2,
      product: bark,
      source: "manual",
    });

    expect(result.steps.length).toBeGreaterThan(3);
    expect(result.steps[0]?.label).toBe("Area to cover");
  });
});
