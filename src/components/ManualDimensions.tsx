"use client";

import { useState } from "react";
import { roundTo } from "@/lib/calc-engine";

export interface ManualArea {
  areaSqFt: number;
}

interface ManualDimensionsProps {
  onAreaChange: (area: ManualArea | null) => void;
}

type Mode = "rectangle" | "sqft";

/**
 * Accessible, no-map equivalent of drawing on the aerial photo.
 * Must reach the same result as MapCanvas — see SPEC.md §9 (accessibility).
 */
export function ManualDimensions({ onAreaChange }: ManualDimensionsProps) {
  const [mode, setMode] = useState<Mode>("rectangle");
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [sqft, setSqft] = useState("");

  const emit = (areaSqFt: number | null) => {
    if (areaSqFt === null || Number.isNaN(areaSqFt) || areaSqFt <= 0) {
      onAreaChange(null);
      return;
    }
    onAreaChange({ areaSqFt: roundTo(areaSqFt, 1) });
  };

  const handleRectangle = (nextLength: string, nextWidth: string) => {
    setLength(nextLength);
    setWidth(nextWidth);
    const l = parseFloat(nextLength);
    const w = parseFloat(nextWidth);
    emit(Number.isFinite(l) && Number.isFinite(w) ? l * w : null);
  };

  const handleSqft = (next: string) => {
    setSqft(next);
    const value = parseFloat(next);
    emit(Number.isFinite(value) ? value : null);
  };

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-slate-200 p-4">
      <div className="flex gap-2 text-sm">
        <button
          type="button"
          onClick={() => setMode("rectangle")}
          className={`rounded px-3 py-1 ${mode === "rectangle" ? "bg-green-700 text-white" : "border border-slate-300"}`}
        >
          Length × width
        </button>
        <button
          type="button"
          onClick={() => setMode("sqft")}
          className={`rounded px-3 py-1 ${mode === "sqft" ? "bg-green-700 text-white" : "border border-slate-300"}`}
        >
          I know the square footage
        </button>
      </div>

      {mode === "rectangle" ? (
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col text-sm">
            Length (ft)
            <input
              type="number"
              inputMode="decimal"
              min={0}
              value={length}
              onChange={(event) => handleRectangle(event.target.value, width)}
              className="w-28 rounded border border-slate-300 px-2 py-1"
            />
          </label>
          <span className="pb-1 text-slate-500">×</span>
          <label className="flex flex-col text-sm">
            Width (ft)
            <input
              type="number"
              inputMode="decimal"
              min={0}
              value={width}
              onChange={(event) => handleRectangle(length, event.target.value)}
              className="w-28 rounded border border-slate-300 px-2 py-1"
            />
          </label>
        </div>
      ) : (
        <label className="flex flex-col text-sm">
          Area (sq ft)
          <input
            type="number"
            inputMode="decimal"
            min={0}
            value={sqft}
            onChange={(event) => handleSqft(event.target.value)}
            className="w-40 rounded border border-slate-300 px-2 py-1"
          />
        </label>
      )}
      <p className="text-xs text-slate-500">
        A smaller 5% waste allowance is used for typed dimensions instead of the
        10% used for hand-drawn areas, since exact numbers leave less to guess.
      </p>
    </div>
  );
}
