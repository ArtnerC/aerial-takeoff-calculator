import { describe, expect, it } from "vitest";
import { polygonAreaSqFt, toClosedPolygon } from "../polygon-area";

describe("toClosedPolygon", () => {
  it("closes an open ring", () => {
    const polygon = toClosedPolygon([
      [0, 0],
      [0, 0.001],
      [0.001, 0.001],
      [0.001, 0],
    ]);
    const ring = polygon.coordinates[0]!;
    expect(ring[0]).toEqual(ring[ring.length - 1]);
  });

  it("leaves an already-closed ring untouched", () => {
    const points: [number, number][] = [
      [0, 0],
      [0, 0.001],
      [0.001, 0.001],
      [0.001, 0],
      [0, 0],
    ];
    const polygon = toClosedPolygon(points);
    expect(polygon.coordinates[0]).toHaveLength(5);
  });

  it("rejects fewer than 3 points", () => {
    expect(() => toClosedPolygon([[0, 0], [1, 1]])).toThrow(RangeError);
  });
});

describe("polygonAreaSqFt", () => {
  it("computes a roughly correct area for a small square near the equator", () => {
    // Approx. 0.001 degrees ~ 111 meters at the equator, so this square is
    // roughly 111m x 111m ~ 12,321 sq meters ~ 132,600 sq ft.
    const polygon = toClosedPolygon([
      [0, 0],
      [0, 0.001],
      [0.001, 0.001],
      [0.001, 0],
    ]);
    const sqFt = polygonAreaSqFt(polygon);
    expect(sqFt).toBeGreaterThan(100000);
    expect(sqFt).toBeLessThan(160000);
  });
});
