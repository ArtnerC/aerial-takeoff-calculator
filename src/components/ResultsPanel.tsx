"use client";

import { useState } from "react";
import type { EstimateResult, Product } from "@/lib/calc-engine";
import { recommendTruckLoads } from "@/lib/fulfilment/zones";
import type { DeliveryZone, FulfilmentMode } from "@/lib/fulfilment/zones";

interface ResultsPanelProps {
  estimate: EstimateResult;
  product: Product;
  fulfilment: FulfilmentMode;
  onFulfilmentChange: (mode: FulfilmentMode) => void;
  zone: DeliveryZone | null;
  hasDestination: boolean;
  phoneDisplay: string;
  phoneHref: string;
}

export function ResultsPanel({
  estimate,
  product,
  fulfilment,
  onFulfilmentChange,
  zone,
  hasDestination,
  phoneDisplay,
  phoneHref,
}: ResultsPanelProps) {
  const [added, setAdded] = useState(false);
  const { truck, loads } = recommendTruckLoads(estimate.cubicYards, estimate.tons);
  const fulfilmentFee = fulfilment === "delivery" ? zone?.fee ?? 0 : 0;
  const total = estimate.materialPrice + fulfilmentFee;
  const belowMinimum = Boolean(
    fulfilment === "delivery" && zone && estimate.cubicYards < zone.minOrderYards
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-4 sm:grid-cols-4">
        <Stat label="Cubic yards" value={`${estimate.cubicYards} yd³`} />
        <Stat label="Weight" value={`${estimate.tons} tons`} />
        <Stat label="Material" value={`$${estimate.materialPrice.toFixed(2)}`} />
        <Stat
          label={fulfilmentFee > 0 ? "Total inc. delivery" : "Estimated total"}
          value={`$${total.toFixed(2)}`}
          highlight
        />
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-slate-900">
          How do you want it?
        </legend>
        <div className="flex flex-wrap gap-2">
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
      </fieldset>

      {fulfilment === "delivery" && (
        <div className="rounded-lg border border-slate-200 p-3 text-sm">
          {!hasDestination ? (
            <p className="text-slate-700">
              Add your address in step 1 to see the delivery fee for your area.
            </p>
          ) : zone ? (
            <>
              <p className="text-slate-700">
                <span className="font-medium text-slate-900">{zone.label}</span> —
                delivery fee ${zone.fee.toFixed(2)}.
              </p>
              <p className="mt-1 text-slate-600">
                Recommended: {truck.label} × {loads}{" "}
                {loads > 1 ? "loads" : "load"}, based on volume and weight limits.
              </p>
              {belowMinimum && (
                <p role="alert" className="mt-2 font-medium text-red-700">
                  This zone has a {zone.minOrderYards} yd³ delivery minimum. Add
                  more material or choose pickup.
                </p>
              )}
            </>
          ) : (
            <p className="text-amber-800">
              That address looks outside our regular delivery area. Call{" "}
              {phoneDisplay} for a quote.
            </p>
          )}
        </div>
      )}

      {fulfilment === "placement" && (
        <p className="rounded-lg border border-slate-200 p-3 text-sm text-slate-600">
          Blower truck placement is estimated from volume alone. Final pricing is
          confirmed by our team based on hose distance and site access.
        </p>
      )}

      <details className="rounded-lg border border-slate-200 p-3">
        <summary className="cursor-pointer text-sm font-medium text-slate-900">
          Show the math
        </summary>
        <ul className="mt-2 flex flex-col gap-1 text-sm text-slate-600">
          {estimate.steps.map((step) => (
            <li key={step.label}>
              <span className="font-medium text-slate-800">{step.label}:</span>{" "}
              {step.value}
            </li>
          ))}
        </ul>
      </details>

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={() => setAdded(true)}
          disabled={belowMinimum}
          className="flex-1 rounded-lg bg-green-700 px-4 py-3 font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Add {estimate.cubicYards} yd³ to cart
        </button>
        <a
          href={phoneHref}
          className="flex-1 rounded-lg border border-slate-300 px-4 py-3 text-center font-semibold text-slate-900 transition hover:bg-slate-50"
        >
          Call {phoneDisplay}
        </a>
      </div>

      {added && (
        <p role="status" className="text-sm text-slate-600">
          Demo only — checkout isn&apos;t wired up to the store yet.
        </p>
      )}

      <p className="text-xs text-slate-500">
        Estimate only. Pricing and quantities are confirmed by Ground Control
        before your order goes out.
      </p>
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
      <div
        className={`text-lg font-semibold ${
          highlight ? "text-green-700" : "text-slate-900"
        }`}
      >
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
      aria-pressed={active}
      onClick={onClick}
      className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
        active
          ? "border-green-700 bg-green-700 text-white"
          : "border-slate-200 bg-white text-slate-900 hover:border-slate-400"
      }`}
    >
      {label}
    </button>
  );
}
