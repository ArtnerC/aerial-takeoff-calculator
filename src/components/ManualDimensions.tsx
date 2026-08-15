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
      <div
        role="group"
        aria-label="How to enter the area"
        className="flex flex-wrap gap-2"
      >
        <button
          type="button"
          aria-pressed={mode === "rectangle"}
          onClick={() => setMode("rectangle")}
          className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
            mode === "rectangle"
              ? "border-green-700 bg-green-700 text-white"
              : "border-slate-200 bg-white text-slate-900 hover:border-slate-400"
          }`}
        >
          Length × width
        </button>
        <button
          type="button"
          aria-pressed={mode === "sqft"}
          onClick={() => setMode("sqft")}
          className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
            mode === "sqft"
              ? "border-green-700 bg-green-700 text-white"
              : "border-slate-200 bg-white text-slate-900 hover:border-slate-400"
          }`}
        >
          I know the square footage
        </button>
      </div>

      {mode === "rectangle" ? (
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-sm text-slate-700">
            Length (ft)
            <input
              type="number"
              inputMode="decimal"
              min={0}
              value={length}
              onChange={(event) => handleRectangle(event.target.value, width)}
              className="w-28 rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900"
            />
          </label>
          <span aria-hidden="true" className="pb-3 text-slate-500">
            ×
          </span>
          <label className="flex flex-col gap-1 text-sm text-slate-700">
            Width (ft)
            <input
              type="number"
              inputMode="decimal"
              min={0}
              value={width}
              onChange={(event) => handleRectangle(length, event.target.value)}
              className="w-28 rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900"
            />
          </label>
        </div>
      ) : (
        <label className="flex flex-col gap-1 text-sm text-slate-700">
          Area (sq ft)
          <input
            type="number"
            inputMode="decimal"
            min={0}
            value={sqft}
            onChange={(event) => handleSqft(event.target.value)}
            className="w-40 rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900"
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
