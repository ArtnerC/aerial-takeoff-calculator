"use client";

import { CATEGORY_LABELS, PRODUCTS } from "@/lib/catalog";
import type { Product } from "@/lib/calc-engine";

interface ProductPickerProps {
  selectedId: string | null;
  onSelect: (product: Product) => void;
}

export function ProductPicker({ selectedId, onSelect }: ProductPickerProps) {
  const byCategory = PRODUCTS.reduce<Record<string, Product[]>>((acc, product) => {
    (acc[product.category] ??= []).push(product);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-4">
      {Object.entries(byCategory).map(([category, products]) => (
        <div key={category}>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            {CATEGORY_LABELS[category] ?? category}
          </h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {products.map((product) => {
              const selected = selectedId === product.id;
              return (
                <button
                  key={product.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onSelect(product)}
                  className={`rounded-lg border p-3 text-left transition ${
                    selected
                      ? "border-green-700 bg-green-50 ring-1 ring-green-700"
                      : "border-slate-200 bg-white hover:border-slate-400"
                  }`}
                >
                  <span className="block text-sm font-medium text-slate-900">
                    {product.name}
                  </span>
                  <span className="mt-0.5 block text-xs text-slate-600">
                    ${product.pricePerUnit}/{product.soldBy === "ton" ? "ton" : "yd³"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
