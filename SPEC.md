# Aerial Takeoff Calculator — Specification

**Client:** Ground Control — Landscape Supplies, Central Point, OR
**Status:** Draft v0.1
**Last updated:** 2026-08-09

---

## 1. Problem

Ground Control sells bulk landscape materials (bark, mulch, compost, topsoil blends, gravel, decorative rock) priced by the cubic yard or ton. Customers almost never know how much they need. Today that gap is closed by a phone call to 541-776-BARK or a guess, which produces three costly outcomes:

1. **Staff time** — every quote consumes several minutes of a yard employee's attention, concentrated in the spring rush.
2. **Lost orders** — the site is closed evenings and most winter Saturdays, exactly when homeowners plan projects. An unanswered "how much do I need" is an abandoned sale.
3. **Under/over-ordering** — under-ordering triggers a second delivery at negative margin; over-ordering produces refund friction and unhappy customers.

The existing Product & Cart Planner quiz narrows *which* product. It does not answer *how much*.

## 2. Solution

A web tool where a customer enters their address, sees an aerial image of their property, traces the areas they want covered, chooses a material and depth, and receives:

- Cubic yards and tons required, including waste factor
- A recommended product from the Ground Control catalog
- Delivery, pickup, or blower-truck placement options with pricing
- A pre-filled WooCommerce cart

## 3. Goals & non-goals

### Goals

- Produce a defensible quantity estimate in under 90 seconds without staff involvement.
- Convert self-serve traffic into carts 24/7.
- Give yard staff a shareable link they can use *with* a customer on the phone.
- Build the reusable coverage-rate, density, and delivery-zone data model that later projects (AI phone agent, contractor portal) will depend on.

### Non-goals (v1)

- Landscape design or rendering.
- Plant selection, irrigation, or drainage engineering.
- Automatic AI segmentation of lawn vs. bed vs. hardscape — deferred to v2 (see §12).
- Payment processing. Checkout stays in the existing WooCommerce flow.
- Contractor accounts, PO numbers, net terms.

## 4. Users

| Persona | Primary need | Design implication |
| --- | --- | --- |
| DIY homeowner | "How much bark for my beds?" | Must be usable on a phone, zero jargon, forgiving of sloppy tracing |
| Contractor / landscaper | Fast takeoff on a job site, multiple zones | Needs multi-area totals, unit toggle, exportable summary |
| Property manager / HOA | Recurring budget numbers across properties | Needs saved/labeled areas and a printable estimate |
| Yard staff | Answer a call faster | Needs a link they can drive while talking, and an override for hand-entered dimensions |

## 5. User flow

1. **Enter location** — address autocomplete, or "use my location", or free pan/zoom. Address is used only to center the map.
2. **Draw areas** — tap/click to place polygon vertices over the aerial image; double-tap to close. Vertices are draggable. Rectangle and circle helpers available for driveways and tree rings. Each area gets an optional label ("front bed", "side yard").
3. **Manual fallback** — a "type dimensions instead" path (length × width, or direct square footage) for anyone who can't or won't draw, and for properties where imagery is stale.
4. **Choose material** — category first (bark & mulch, topsoil, aggregate, decorative rock), then specific product. Products carry their own default depth and density.
5. **Choose depth** — preset chips (1", 2", 3", 4", 6") with a plain-language hint for the selected use case. Custom depth allowed.
6. **Results** — cubic yards, tons, bag-equivalent for small jobs, and price. Shows the math so the number is trustworthy.
7. **Fulfilment** — pickup at the yard, delivery (with zone-based fee), or blower-truck placement. Surfaces truck-capacity implications, e.g. "this needs 2 loads."
8. **Act** — add to cart, email/text the estimate to myself, or request a callback.

## 6. Calculations

All formulas must be visible to the user on request ("show the math"), because trust is the product.

### Area

Polygon area computed geodesically from lat/lng vertices (not screen pixels), so it stays correct at any zoom or latitude. Reported in square feet.

### Volume

```
cubic_yards = area_sqft × (depth_inches / 12) / 27
```

Equivalently, 1 yd³ covers 324 sq ft at 1", 162 at 2", 108 at 3", 81 at 4".

### Waste factor

A configurable uplift applied before rounding. Default **10%** for irregular/traced areas, **5%** for manually entered rectangles. Rationale must be shown to the user.

### Weight

```
tons = cubic_yards × density_tons_per_yard
```

Density is a per-product value in the catalog, not a global constant. Bark is light and volume-limited; aggregate is heavy and weight-limited. **Placeholder ranges pending confirmation from Ground Control:**

| Material | Approx. tons / yd³ |
| --- | --- |
| Bark / mulch | 0.4 – 0.5 |
| Compost | 0.6 – 0.8 |
| Topsoil blends | 1.0 – 1.3 |
| Sand | 1.2 – 1.4 |
| Crushed rock / gravel | 1.3 – 1.5 |

> **Open item:** these must be replaced with Ground Control's actual measured values before launch. Do not ship with estimates.

### Compaction

For base rock and driveway applications, an additional compaction factor (~1.2, product-specific) applies to loose-to-compacted volume. Only surfaced when the selected product is flagged as a compacted-base material.

### Rounding

Round up to the yard's minimum sellable increment (assumed 0.5 yd³ — confirm). Always round up, never down, and say so.

## 7. Fulfilment logic

### Delivery zones

Zones derived from driving distance from **6351 Blackwell Rd, Central Point, OR 97502**, covering Medford, Central Point, Ashland, Phoenix, Talent, Eagle Point, White City, Jacksonville, and Grants Pass. Implementation: a zone lookup keyed on geocoded destination, evaluated as a set of configurable distance bands with a per-band fee and minimum order. Addresses outside the outermost band route to "call us for a quote."

### Truck selection

Given quantity and material density, recommend a truck type and load count. Must respect **both** volume and legal weight limits — a full-volume load of decorative rock will hit weight limits long before it fills the box.

| Mode | Use |
| --- | --- |
| Dump truck (multiple sizes) | Bulk loose material |
| Forklift flatbed | Palletized goods — pavers, retaining wall block, turf |
| Bulk semi | Large commercial orders |

> **Open item:** capacities, per-load pricing, and split-load rules to be supplied by Ground Control.

### Blower / CAD truck placement

Offered when the material is blowable (bark, compost, soil blends, some decorative rock) and the area qualifies. Estimate placement cost from volume plus an access difficulty input (hose distance from where the truck can park, slope, gates). v1 produces an *estimated* placement price with an explicit "final price confirmed by our team" disclaimer, since site access is not knowable from aerial imagery alone.

## 8. Architecture

```
Next.js (App Router, TypeScript)
├─ Map layer        MapLibre GL / Mapbox GL JS + satellite raster tiles
├─ Geometry         Turf.js (geodesic area, polygon validation)
├─ Geocoding        Provider autocomplete API, server-proxied
├─ Calc engine      Pure TypeScript module, zero UI deps, fully unit-tested
├─ Catalog          Products, densities, depths, coverage rules
└─ Commerce         WooCommerce Store API → pre-filled cart handoff
```

Deployment: static/edge-hosted front end, serverless routes for geocoding proxy, catalog reads, and estimate persistence.

### Design constraints

- **The calc engine is a standalone, dependency-free module.** It will be reused verbatim by the AI phone agent and the contractor portal. It must be callable server-side with no map or browser context.
- **Catalog is data, not code.** Densities, depths, prices, and zones live in editable config so Ground Control can update them without a deploy.
- **Mobile-first.** A significant share of use will be someone standing in their own yard.

### Data model (sketch)

```ts
type Product = {
  id: string;
  sku: string;
  name: string;
  category: 'bark_mulch' | 'topsoil' | 'aggregate' | 'natural_stone' | 'accessory';
  soldBy: 'cubic_yard' | 'ton' | 'each' | 'pallet';
  densityTonsPerYard: number;
  defaultDepthInches: number;
  minDepthInches: number;
  maxDepthInches: number;
  blowable: boolean;
  compactionFactor?: number;
  wooProductId: number;
};

type MeasuredArea = {
  id: string;
  label?: string;
  source: 'drawn' | 'manual';
  polygon?: GeoJSON.Polygon;
  areaSqFt: number;
};

type Estimate = {
  id: string;
  createdAt: string;
  destination?: { lat: number; lng: number; formattedAddress: string };
  areas: MeasuredArea[];
  productId: string;
  depthInches: number;
  wastePercent: number;
  cubicYards: number;
  tons: number;
  fulfilment: 'pickup' | 'delivery' | 'placement';
  deliveryZoneId?: string;
  materialPrice: number;
  fulfilmentPrice: number;
  total: number;
};
```

Saved estimates are retrievable by opaque ID via shareable link — this is what lets staff and customers collaborate over the phone.

## 9. Non-functional requirements

- **Performance** — interactive in under 2.5s on 4G mobile; drawing must feel immediate.
- **Accessibility** — WCAG 2.1 AA. The manual-dimensions path is the accessible equivalent of the drawing path and must reach the same result.
- **Browser support** — current Chrome, Safari, Firefox, Edge; iOS and Android Safari/Chrome.
- **Analytics** — funnel instrumentation at every step (started, drew area, picked product, saw result, added to cart, requested callback). Without this we cannot prove ROI.
- **Resilience** — if the tile or geocoding provider fails, the manual-dimensions path must still work. Never a dead end.

## 10. Security & privacy

- Map, geocoding, and commerce API keys held server-side; the browser calls our proxy routes only. No provider key is ever shipped to the client.
- Proxy routes are rate-limited and origin-restricted to prevent quota theft.
- Addresses and property polygons are personal data. Collect the minimum, state retention plainly, and do not require an account or an email address to see a result.
- All inputs (depth, area, quantity) validated server-side before any price is computed or a cart is built. Client-side numbers are never trusted for pricing.
- Estimate share links use unguessable IDs and contain no PII in the URL.
- Comply with the existing site privacy policy and SMS terms if estimate-by-text is enabled.

## 11. Success metrics

| Metric | Target |
| --- | --- |
| Completion rate (start → result) | > 60% |
| Result → add-to-cart | > 20% |
| Self-serve estimates per week | Baseline in month 1, growth thereafter |
| "How much do I need" calls | Measurable reduction during spring rush |
| Second/corrective deliveries | Reduction vs. prior season |

## 12. Phasing

**Phase 1 — Core takeoff**
Map, polygon drawing, manual fallback, calc engine, product picker, depth presets, results with visible math. No commerce.

**Phase 2 — Commerce & fulfilment**
Catalog sync, delivery zones, truck/load logic, WooCommerce cart handoff, saved/shareable estimates.

**Phase 3 — Placement & polish**
Blower-truck estimator with access inputs, multi-area labeling, printable/emailable estimate, staff-assisted mode.

**Phase 4 — Intelligence**
Aerial segmentation to auto-suggest bed and lawn polygons; project templates (defensible space zones, driveway rebuild, new lawn prep); reorder prompts from prior estimates.

## 13. Open questions for Ground Control

1. Measured density (tons/yd³) for each bulk product.
2. Minimum sellable increment and whether it differs by product.
3. Current delivery zone boundaries, fees, and minimum order per zone.
4. Truck capacities by type, in both volume and legal weight, plus per-load pricing.
5. Blower-truck pricing model and maximum practical hose distance.
6. Preferred waste factor — is 10% consistent with what staff quote today?
7. WooCommerce version, and whether the Store API is available for programmatic cart building.
8. Who maintains catalog pricing, and where is the source of truth today?
9. Does the existing Product & Cart Planner stay, get absorbed, or feed into this?

---

## Appendix A — Reference coverage table

Square feet covered by one cubic yard:

| Depth | Coverage (sq ft) |
| --- | --- |
| 1" | 324 |
| 2" | 162 |
| 3" | 108 |
| 4" | 81 |
| 6" | 54 |
| 12" | 27 |

Useful as a sanity check on engine output and as customer-facing content.
