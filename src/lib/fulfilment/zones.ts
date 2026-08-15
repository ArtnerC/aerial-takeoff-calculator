import type { Product } from "@/lib/calc-engine";

export type FulfilmentMode = "pickup" | "delivery" | "placement";

export interface DeliveryZone {
  id: string;
  label: string;
  maxDistanceMiles: number;
  fee: number;
  minOrderYards: number;
}

/**
 * PLACEHOLDER zones. Real boundaries, fees, and minimums must come from
 * Ground Control — see SPEC.md §13, open question 3.
 */
export const DELIVERY_ZONES: DeliveryZone[] = [
  { id: "zone-1", label: "Central Point / Medford core", maxDistanceMiles: 8, fee: 45, minOrderYards: 3 },
  { id: "zone-2", label: "Ashland / Phoenix / Talent / Eagle Point", maxDistanceMiles: 20, fee: 75, minOrderYards: 5 },
  { id: "zone-3", label: "Grants Pass / outer Rogue Valley", maxDistanceMiles: 35, fee: 120, minOrderYards: 8 },
];

export function zoneForDistance(distanceMiles: number): DeliveryZone | null {
  return DELIVERY_ZONES.find((zone) => distanceMiles <= zone.maxDistanceMiles) ?? null;
}

export interface TruckOption {
  label: string;
  maxCubicYards: number;
  maxTons: number;
}

/** PLACEHOLDER capacities — see SPEC.md §13, open question 4. */
export const TRUCK_OPTIONS: TruckOption[] = [
  { label: "Dump truck (small)", maxCubicYards: 6, maxTons: 8 },
  { label: "Dump truck (large)", maxCubicYards: 12, maxTons: 16 },
  { label: "Bulk semi", maxCubicYards: 24, maxTons: 25 },
];

export function recommendTruckLoads(
  cubicYards: number,
  tons: number
): { truck: TruckOption; loads: number } {
  for (const truck of TRUCK_OPTIONS) {
    const loadsByVolume = Math.ceil(cubicYards / truck.maxCubicYards);
    const loadsByWeight = Math.ceil(tons / truck.maxTons);
    const loads = Math.max(loadsByVolume, loadsByWeight);
    if (loads <= 1 || truck.label === TRUCK_OPTIONS[TRUCK_OPTIONS.length - 1]?.label) {
      return { truck, loads: Math.max(loads, 1) };
    }
  }
  const fallback = TRUCK_OPTIONS[TRUCK_OPTIONS.length - 1]!;
  return {
    truck: fallback,
    loads: Math.max(
      Math.ceil(cubicYards / fallback.maxCubicYards),
      Math.ceil(tons / fallback.maxTons),
      1
    ),
  };
}

export function isBlowable(product: Product): boolean {
  return product.blowable;
}
