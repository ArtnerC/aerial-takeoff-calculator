"use client";

import type { Product } from "@/lib/calc-engine";

const PRESET_DEPTHS = [1, 2, 3, 4, 6];

const DEPTH_HINTS: Record<number, string> = {
  1: "Top-dressing / refresh",
  2: "Ground cover, weed suppression",
  3: "Standard bed depth",
  4: "New bed or base layer",
  6: "Driveway / drainage base",
};

interface DepthSelectorProps {
  product: Product | null;
  depthInches: number;
  onChange: (depth: number) => void;
}

export function DepthSelector({ product, depthInches, onChange }: DepthSelectorProps) {
  const min = product?.minDepthInches ?? 1;
  const max = product?.maxDepthInches ?? 12;
  const availablePresets = PRESET_DEPTHS.filter((d) => d >= min && d <= max);
  const outOfRange = depthInches < min || depthInches > max;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {availablePresets.map((depth) => {
          const active = depthInches === depth;
          return (
            <button
              key={depth}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(depth)}
              className={`min-w-[3rem] rounded-lg border px-3 py-2 text-sm font-medium transition ${
                active
                  ? "border-green-700 bg-green-700 text-white"
                  : "border-slate-200 bg-white text-slate-900 hover:border-slate-400"
              }`}
            >
              {depth}&quot;
            </button>
          );
        })}

        <label className="flex items-center gap-2 text-sm text-slate-700">
          <span>Custom</span>
          <input
            type="number"
            inputMode="decimal"
            min={min}
            max={max}
            step="0.5"
            value={depthInches}
            onChange={(event) => onChange(Number(event.target.value))}
            aria-label={`Custom depth in inches, between ${min} and ${max}`}
            aria-invalid={outOfRange}
            className="w-20 rounded-lg border border-slate-300 bg-white px-2 py-2 text-slate-900"
          />
          <span>in</span>
        </label>
      </div>

      {product && !outOfRange && DEPTH_HINTS[depthInches] && (
        <p className="text-sm text-slate-600">{DEPTH_HINTS[depthInches]}</p>
      )}

      {product && outOfRange && (
        <p role="alert" className="text-sm font-medium text-red-700">
          {product.name} supports {min}&quot;–{max}&quot; depths. Pick a value in
          that range to see your estimate.
        </p>
      )}
    </div>
  );
}
