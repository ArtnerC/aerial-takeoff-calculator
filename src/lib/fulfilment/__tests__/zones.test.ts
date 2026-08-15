import { describe, expect, it } from "vitest";
import { recommendTruckLoads, zoneForDistance } from "../zones";

describe("zoneForDistance", () => {
  it("picks the nearest matching zone", () => {
    expect(zoneForDistance(5)?.id).toBe("zone-1");
    expect(zoneForDistance(15)?.id).toBe("zone-2");
    expect(zoneForDistance(30)?.id).toBe("zone-3");
  });

  it("returns null outside all configured zones", () => {
    expect(zoneForDistance(100)).toBeNull();
  });
});

describe("recommendTruckLoads", () => {
  it("recommends a single small dump truck for a small order", () => {
    const { truck, loads } = recommendTruckLoads(4, 2);
    expect(truck.label).toBe("Dump truck (small)");
    expect(loads).toBe(1);
  });

  it("escalates to a larger truck when weight would force extra loads", () => {
    // 5 yd3 fits in the small truck's volume, but 9 tons exceeds its 8 ton
    // limit, so it should escalate to the large dump truck for a single load.
    const { truck, loads } = recommendTruckLoads(5, 9);
    expect(truck.label).toBe("Dump truck (large)");
    expect(loads).toBe(1);
  });

  it("reports multiple loads when even the largest truck can't fit it in one", () => {
    const { loads } = recommendTruckLoads(10, 50);
    expect(loads).toBeGreaterThanOrEqual(2);
  });

  it("never recommends fewer than 1 load", () => {
    const { loads } = recommendTruckLoads(0.5, 0.2);
    expect(loads).toBe(1);
  });
});
