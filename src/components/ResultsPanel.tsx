"use client";

import type { EstimateResult, Product } from "@/lib/calc-engine";
import { recommendTruckLoads } from "@/lib/fulfilment/zones";
import type { DeliveryZone, FulfilmentMode } from "@/lib/fulfilment/zones";

interface ResultsPanelProps {
  estimate: EstimateResult;
  product: Product;
  fulfilment: FulfilmentMode;
  onFulfilmentChange: (mode: FulfilmentMode) => void;
  zone: DeliveryZone | null;
}

export function ResultsPanel({
  estimate,
  product,
  fulfilment,
  onFulfilmentChange,
  zone,
}: ResultsPanelProps) {
  const { truck, loads } = recommendTruckLoads(estimate.cubicYards, estimate.tons);
  const fulfilmentFee = fulfilment === "delivery" ? zone?.fee ?? 0 : 0;
  const total = estimate.materialPrice + fulfilmentFee;
  const meetsMinimum = !zone || estimate.cubicYards >= zone.minOrderYards;

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-slate-200 p-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Cubic yards" value={`${estimate.cubicYards} yd³`} />
        <Stat label="Weight" value={`${estimate.tons} tons`} />
        <Stat label="Material" value={`$${estimate.materialPrice.toFixed(2)}`} />
        <Stat label="Est. total" value={`$${total.toFixed(2)}`} highlight />
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        <FulfilmentButton
          label="Pickup at the yard"
          active={fulfilment === "pickup"}
          onClick={() => onFulfilmentChange("pickup")}
        />
        <FulfilmentButton
          label="Delivery"
          active={fulfilment === "delivery"}
          onClick={() => onFulfilmentChange("delivery")}
        />
        {product.blowable && (
          <FulfilmentButton
            label="Blower truck placement"
            active={fulfilment === "placement"}
            onClick={() => onFulfilmentChange("placement")}
          />
        )}
      </div>

      {fulfilment === "delivery" && (
        <div className="rounded bg-slate-50 p-3 text-sm">
          {zone ? (
            <>
              <p>
                Delivery zone: <strong>{zone.label}</strong> — estimated fee $
                {zone.fee.toFixed(2)}.
              </p>
              {!meetsMinimum && (
                <p className="mt-1 text-red-600">
                  This zone has a {zone.minOrderYards} yd³ delivery minimum. Add
                  more material or choose pickup.
                </p>
              )}
              <p className="mt-1 text-slate-500">
                Recommended truck: {truck.label} × {loads}{" "}
                {loads > 1 ? "loads" : "load"} (based on volume and weight
                limits).
              </p>
            </>
          ) : (
            <p className="text-amber-700">
              We couldn&apos;t confirm a delivery zone for this address. Call
              541-776-BARK for a quote.
            </p>
          )}
        </div>
      )}

      {fulfilment === "placement" && (
        <div className="rounded bg-slate-50 p-3 text-sm text-slate-600">
          Blower truck placement estimated from volume alone. Final price is
          confirmed by our team based on hose distance and site access.
        </div>
      )}

      <details className="text-sm">
        <summary className="cursor-pointer font-medium text-slate-700">
          Show the math
        </summary>
        <ul className="mt-2 flex flex-col gap-1 text-slate-600">
          {estimate.steps.map((step) => (
            <li key={step.label}>
              <span className="font-medium">{step.label}:</span> {step.value}
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className={`text-lg font-semibold ${highlight ? "text-green-700" : ""}`}>
        {value}
      </div>
    </div>
  );
}

function FulfilmentButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded border px-3 py-1 ${
        active ? "border-green-700 bg-green-700 text-white" : "border-slate-300"
      }`}
    >
      {label}
    </button>
  );
}
