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
          <h3 className="mb-2 text-sm font-semibold text-slate-700">
            {CATEGORY_LABELS[category] ?? category}
          </h3>
          <div className="flex flex-wrap gap-2">
            {products.map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() => onSelect(product)}
                className={`rounded-lg border px-3 py-2 text-left text-sm transition ${
                  selectedId === product.id
                    ? "border-green-700 bg-green-50 ring-1 ring-green-700"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="font-medium">{product.name}</div>
                <div className="text-xs text-slate-500">
                  ${product.pricePerUnit}/{product.soldBy === "ton" ? "ton" : "yd³"}
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
