import { describe, expect, it } from "vitest";
import {
  applyCompaction,
  applyWaste,
  ceilToIncrement,
  coverageSqFtPerCubicYard,
  cubicYardsToTons,
  defaultWastePercentFor,
  rawCubicYards,
} from "../math";

describe("coverageSqFtPerCubicYard", () => {
  it("matches the reference coverage table in SPEC.md Appendix A", () => {
    expect(coverageSqFtPerCubicYard(1)).toBeCloseTo(324, 5);
    expect(coverageSqFtPerCubicYard(2)).toBeCloseTo(162, 5);
    expect(coverageSqFtPerCubicYard(3)).toBeCloseTo(108, 5);
    expect(coverageSqFtPerCubicYard(4)).toBeCloseTo(81, 5);
    expect(coverageSqFtPerCubicYard(6)).toBeCloseTo(54, 5);
    expect(coverageSqFtPerCubicYard(12)).toBeCloseTo(27, 5);
  });

  it("throws for non-positive depth", () => {
    expect(() => coverageSqFtPerCubicYard(0)).toThrow(RangeError);
    expect(() => coverageSqFtPerCubicYard(-1)).toThrow(RangeError);
  });
});

describe("rawCubicYards", () => {
  it("computes volume from area and depth", () => {
    // 324 sq ft at 1" is exactly 1 cubic yard.
    expect(rawCubicYards(324, 1)).toBeCloseTo(1, 5);
    // 1000 sq ft at 3" depth.
    expect(rawCubicYards(1000, 3)).toBeCloseTo(9.259259, 5);
  });

  it("rejects negative area or non-positive depth", () => {
    expect(() => rawCubicYards(-1, 2)).toThrow(RangeError);
    expect(() => rawCubicYards(100, 0)).toThrow(RangeError);
  });

  it("returns zero for a zero-area lot", () => {
    expect(rawCubicYards(0, 2)).toBe(0);
  });
});

describe("applyWaste", () => {
  it("adds the waste percentage on top of raw volume", () => {
    expect(applyWaste(10, 10)).toBeCloseTo(11, 5);
    expect(applyWaste(10, 0)).toBeCloseTo(10, 5);
  });

  it("rejects negative waste percent", () => {
    expect(() => applyWaste(10, -5)).toThrow(RangeError);
  });
});

describe("defaultWastePercentFor", () => {
  it("uses 10% for drawn areas and 5% for manual entry", () => {
    expect(defaultWastePercentFor("drawn")).toBe(10);
    expect(defaultWastePercentFor("manual")).toBe(5);
  });
});

describe("applyCompaction", () => {
  it("applies the factor only when requested and available", () => {
    expect(applyCompaction(10, 1.2, true)).toBeCloseTo(12, 5);
    expect(applyCompaction(10, 1.2, false)).toBe(10);
    expect(applyCompaction(10, undefined, true)).toBe(10);
  });
});

describe("ceilToIncrement", () => {
  it("rounds up to the nearest sellable increment", () => {
    expect(ceilToIncrement(2.1, 0.5)).toBeCloseTo(2.5, 5);
    expect(ceilToIncrement(2.5, 0.5)).toBeCloseTo(2.5, 5);
    expect(ceilToIncrement(2.51, 0.5)).toBeCloseTo(3, 5);
  });

  it("never rounds down, even with floating point noise", () => {
    // 0.1 + 0.2 style floating point error should not round down a full increment.
    expect(ceilToIncrement(2.4999999999, 0.5)).toBeCloseTo(2.5, 5);
  });

  it("passes through unchanged when increment is non-positive", () => {
    expect(ceilToIncrement(3.456, 0)).toBeCloseTo(3.46, 5);
  });
});

describe("cubicYardsToTons", () => {
  it("multiplies by density and rounds to 2 decimals", () => {
    expect(cubicYardsToTons(3, 0.45)).toBeCloseTo(1.35, 5);
    expect(cubicYardsToTons(2.5, 1.35)).toBeCloseTo(3.38, 2);
  });
});
