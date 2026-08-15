import { area as turfArea } from "@turf/turf";
import type { Polygon } from "geojson";
import { squareMetersToSquareFeet } from "../calc-engine/math";

/**
 * Computes geodesic polygon area in square feet from lat/lng vertices.
 * Using geodesic area (not screen pixels) keeps the result correct at any
 * map zoom level or latitude — see SPEC.md §6.
 */
export function polygonAreaSqFt(polygon: Polygon): number {
  const sqMeters = turfArea(polygon);
  return squareMetersToSquareFeet(sqMeters);
}

/** Builds a valid GeoJSON polygon from an ordered ring of [lng, lat] points, closing the ring if needed. */
export function toClosedPolygon(points: [number, number][]): Polygon {
  if (points.length < 3) {
    throw new RangeError("A polygon needs at least 3 points");
  }
  const [first] = points;
  const last = points[points.length - 1];
  const ring =
    first && last && (first[0] !== last[0] || first[1] !== last[1])
      ? [...points, first]
      : points;

  return {
    type: "Polygon",
    coordinates: [ring],
  };
}
