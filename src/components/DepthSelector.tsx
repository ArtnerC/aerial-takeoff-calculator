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

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {availablePresets.map((depth) => (
          <button
            key={depth}
            type="button"
            onClick={() => onChange(depth)}
            className={`rounded-full border px-3 py-1 text-sm ${
              depthInches === depth
                ? "border-green-700 bg-green-700 text-white"
                : "border-slate-300"
            }`}
            title={DEPTH_HINTS[depth]}
          >
            {depth}&quot;
          </button>
        ))}
        <label className="flex items-center gap-2 text-sm">
          Custom
          <input
            type="number"
            min={min}
            max={max}
            value={depthInches}
            onChange={(event) => onChange(Number(event.target.value))}
            className="w-16 rounded border border-slate-300 px-2 py-1"
          />
          in
        </label>
      </div>
      {product && DEPTH_HINTS[depthInches] && (
        <p className="text-xs text-slate-500">{DEPTH_HINTS[depthInches]}</p>
      )}
      {product && (depthInches < min || depthInches > max) && (
        <p className="text-xs text-red-600">
          {product.name} supports {min}&quot;–{max}&quot; depths.
        </p>
      )}
    </div>
  );
}
