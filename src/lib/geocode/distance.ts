import { distance as turfDistance, point } from "@turf/turf";

/** Ground Control's retail yard — 6351 Blackwell Rd, Central Point, OR 97502. */
export const YARD_LOCATION: [number, number] = [-122.9452682, 42.4081702];

export function milesFromYard(lng: number, lat: number): number {
  return turfDistance(point(YARD_LOCATION), point([lng, lat]), { units: "miles" });
}
