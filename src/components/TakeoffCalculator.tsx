"use client";

import { useMemo, useState } from "react";
import { AddressSearch, type GeocodeCandidate } from "./AddressSearch";
import { MapCanvas, type DrawnArea } from "./MapCanvas";
import { ManualDimensions, type ManualArea } from "./ManualDimensions";
import { ProductPicker } from "./ProductPicker";
import { DepthSelector } from "./DepthSelector";
import { ResultsPanel } from "./ResultsPanel";
import { calculateEstimate, type Product } from "@/lib/calc-engine";
import { zoneForDistance, type FulfilmentMode } from "@/lib/fulfilment/zones";
import { milesFromYard } from "@/lib/geocode/distance";

type InputMode = "draw" | "manual";

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

  const distanceMiles = destination
    ? destination.distanceMilesFromYard
    : mapCenter
    ? milesFromYard(mapCenter[0], mapCenter[1])
    : null;

  const zone = distanceMiles !== null ? zoneForDistance(distanceMiles) : null;

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
    <div className="mx-auto flex max-w-3xl flex-col gap-8 p-4 pb-16">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">
          Aerial Takeoff Calculator
        </h1>
        <p className="text-slate-600">
          Trace your project area, pick a material, and get an instant yard,
          ton, and delivery estimate.
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">1. Find your property</h2>
        <AddressSearch
          onSelect={(candidate) => {
            setDestination(candidate);
            setMapCenter([candidate.lng, candidate.lat]);
          }}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">2. Mark the area</h2>
        <div className="flex gap-2 text-sm">
          <button
            type="button"
            onClick={() => setInputMode("draw")}
            className={`rounded px-3 py-1 ${inputMode === "draw" ? "bg-green-700 text-white" : "border border-slate-300"}`}
          >
            Draw on the map
          </button>
          <button
            type="button"
            onClick={() => setInputMode("manual")}
            className={`rounded px-3 py-1 ${inputMode === "manual" ? "bg-green-700 text-white" : "border border-slate-300"}`}
          >
            Type dimensions instead
          </button>
        </div>

        {inputMode === "draw" ? (
          <MapCanvas center={mapCenter} onAreaChange={setDrawnArea} />
        ) : (
          <ManualDimensions onAreaChange={setManualArea} />
        )}

        {areaSqFt !== null && (
          <p className="text-sm text-slate-600">
            Area: <strong>{areaSqFt.toLocaleString()} sq ft</strong>
          </p>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">3. Choose a material</h2>
        <ProductPicker selectedId={product?.id ?? null} onSelect={setProduct} />
      </section>

      {product && (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">4. Choose a depth</h2>
          <DepthSelector
            product={product}
            depthInches={depthInches}
            onChange={setDepthInches}
          />
        </section>
      )}

      {estimate && product && (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">5. Your estimate</h2>
          <ResultsPanel
            estimate={estimate}
            product={product}
            fulfilment={fulfilment}
            onFulfilmentChange={setFulfilment}
            zone={zone}
          />
        </section>
      )}

      {!estimate && areaSqFt && product && (
        <p className="text-sm text-red-600">
          {product.name} supports {product.minDepthInches}&quot;–
          {product.maxDepthInches}&quot; depths. Adjust the depth above to see
          an estimate.
        </p>
      )}
    </div>
  );
}
