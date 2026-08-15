"use client";

import { useMemo, useState } from "react";
import { AddressSearch, type GeocodeCandidate } from "./AddressSearch";
import { MapCanvas, type DrawnArea } from "./MapCanvas";
import { ManualDimensions, type ManualArea } from "./ManualDimensions";
import { ProductPicker } from "./ProductPicker";
import { DepthSelector } from "./DepthSelector";
import { ResultsPanel } from "./ResultsPanel";
import { StepSection } from "./StepSection";
import { SegmentedControl } from "./SegmentedControl";
import { calculateEstimate, type Product } from "@/lib/calc-engine";
import { zoneForDistance, type FulfilmentMode } from "@/lib/fulfilment/zones";

type InputMode = "draw" | "manual";

const PHONE_DISPLAY = "541-776-BARK (2275)";
const PHONE_HREF = "tel:15417762275";

export function TakeoffCalculator() {
  const [inputMode, setInputMode] = useState<InputMode>("draw");
  const [drawnArea, setDrawnArea] = useState<DrawnArea | null>(null);
  const [manualArea, setManualArea] = useState<ManualArea | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number] | undefined>(undefined);
  const [destination, setDestination] = useState<GeocodeCandidate | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [depthInches, setDepthInches] = useState<number>(3);
  const [fulfilment, setFulfilment] = useState<FulfilmentMode>("pickup");

  const areaSqFt =
    inputMode === "draw" ? drawnArea?.areaSqFt ?? null : manualArea?.areaSqFt ?? null;

  // Only a confirmed address gives a trustworthy delivery distance; the map
  // centre is just wherever the user happens to be looking.
  const zone = destination
    ? zoneForDistance(destination.distanceMilesFromYard)
    : null;

  /** Keeps depth inside the newly chosen product's supported range so the
   *  estimate can never silently disappear behind a validation error. */
  const handleProductSelect = (next: Product) => {
    setProduct(next);
    setDepthInches((current) =>
      current < next.minDepthInches || current > next.maxDepthInches
        ? next.defaultDepthInches
        : current
    );
  };

  const estimate = useMemo(() => {
    if (!product || !areaSqFt || areaSqFt <= 0) return null;
    if (depthInches < product.minDepthInches || depthInches > product.maxDepthInches) {
      return null;
    }
    return calculateEstimate({
      areaSqFt,
      depthInches,
      product,
      source: inputMode === "draw" ? "drawn" : "manual",
      applyCompaction: fulfilment === "delivery" && Boolean(product.compactionFactor),
    });
  }, [product, areaSqFt, depthInches, inputMode, fulfilment]);

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-4 sm:py-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-green-700">
            Ground Control
          </p>
          <h1 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">
            Aerial Takeoff Calculator
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Trace your project area, pick a material, and get an instant cubic
            yard, ton, and delivery estimate.
          </p>
        </div>
      </header>

      <main className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-5 pb-24">
        <StepSection
          step={1}
          title="Find your property"
          optional
          hint="Centres the map and unlocks delivery pricing for your address."
          complete={Boolean(destination)}
        >
          <AddressSearch
            onSelect={(candidate) => {
              setDestination(candidate);
              setMapCenter([candidate.lng, candidate.lat]);
            }}
          />
          {destination && (
            <p className="mt-2 text-sm text-slate-600">
              Using{" "}
              <span className="font-medium text-slate-900">
                {destination.formattedAddress}
              </span>{" "}
              — {destination.distanceMilesFromYard} mi from our Central Point
              yard.
            </p>
          )}
        </StepSection>

        <StepSection step={2} title="Mark the area" complete={Boolean(areaSqFt)}>
          <div className="mb-3">
            <SegmentedControl
              label="How would you like to measure?"
              value={inputMode}
              onChange={setInputMode}
              options={[
                { value: "draw", label: "Draw on the map" },
                { value: "manual", label: "Type dimensions" },
              ]}
            />
          </div>

          {inputMode === "draw" ? (
            <MapCanvas center={mapCenter} onAreaChange={setDrawnArea} />
          ) : (
            <ManualDimensions onAreaChange={setManualArea} />
          )}

          {areaSqFt !== null && areaSqFt > 0 && (
            <p className="mt-3 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-900">
              Area to cover:{" "}
              <strong className="font-semibold">
                {areaSqFt.toLocaleString()} sq ft
              </strong>
            </p>
          )}
        </StepSection>

        <StepSection step={3} title="Choose a material" complete={Boolean(product)}>
          <ProductPicker
            selectedId={product?.id ?? null}
            onSelect={handleProductSelect}
          />
        </StepSection>

        <StepSection
          step={4}
          title="Choose a depth"
          hint={
            product ? undefined : "Pick a material first — depth options depend on it."
          }
          complete={Boolean(product && estimate)}
        >
          {product ? (
            <DepthSelector
              product={product}
              depthInches={depthInches}
              onChange={setDepthInches}
            />
          ) : (
            <p className="text-sm text-slate-500">Waiting on a material selection.</p>
          )}
        </StepSection>

        <StepSection step={5} title="Your estimate" complete={Boolean(estimate)}>
          {estimate && product ? (
            <ResultsPanel
              estimate={estimate}
              product={product}
              fulfilment={fulfilment}
              onFulfilmentChange={setFulfilment}
              zone={zone}
              hasDestination={Boolean(destination)}
              phoneDisplay={PHONE_DISPLAY}
              phoneHref={PHONE_HREF}
            />
          ) : (
            <p className="text-sm text-slate-500">
              {!areaSqFt
                ? "Mark an area above to see your estimate."
                : !product
                ? "Choose a material above to see your estimate."
                : "Adjust the depth above to see your estimate."}
            </p>
          )}
        </StepSection>

        <p className="px-1 text-center text-sm text-slate-600">
          Not sure what you need?{" "}
          <a
            href={PHONE_HREF}
            className="font-semibold text-green-700 underline underline-offset-2"
          >
            Call {PHONE_DISPLAY}
          </a>{" "}
          and a real person can help.
        </p>
      </main>
    </div>
  );
}
