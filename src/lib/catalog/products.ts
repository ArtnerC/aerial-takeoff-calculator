import type { Product } from "../calc-engine/types";

/**
 * PLACEHOLDER CATALOG.
 * Densities, prices, and increments here are industry-typical estimates,
 * not Ground Control's measured values. Do not ship to production before
 * replacing with confirmed data — see SPEC.md §13, open question 1-2.
 */
export const PRODUCTS: Product[] = [
  {
    id: "bark-fine-fir",
    sku: "BARK-FF",
    name: "Fine Fir Bark",
    category: "bark_mulch",
    soldBy: "cubic_yard",
    densityTonsPerYard: 0.45,
    defaultDepthInches: 3,
    minDepthInches: 1,
    maxDepthInches: 6,
    blowable: true,
    minIncrementYards: 0.5,
    pricePerUnit: 45,
  },
  {
    id: "bark-medium-fir",
    sku: "BARK-MF",
    name: "Medium Fir Bark",
    category: "bark_mulch",
    soldBy: "cubic_yard",
    densityTonsPerYard: 0.42,
    defaultDepthInches: 3,
    minDepthInches: 2,
    maxDepthInches: 6,
    blowable: true,
    minIncrementYards: 0.5,
    pricePerUnit: 42,
  },
  {
    id: "compost-premium",
    sku: "COMP-PREM",
    name: "Premium Compost",
    category: "topsoil",
    soldBy: "cubic_yard",
    densityTonsPerYard: 0.7,
    defaultDepthInches: 2,
    minDepthInches: 1,
    maxDepthInches: 4,
    blowable: true,
    minIncrementYards: 0.5,
    pricePerUnit: 48,
  },
  {
    id: "topsoil-blend",
    sku: "SOIL-BLEND",
    name: "Garden Topsoil Blend",
    category: "topsoil",
    soldBy: "cubic_yard",
    densityTonsPerYard: 1.15,
    defaultDepthInches: 4,
    minDepthInches: 2,
    maxDepthInches: 12,
    blowable: true,
    minIncrementYards: 0.5,
    pricePerUnit: 40,
  },
  {
    id: "agg-3-4-minus",
    sku: "AGG-34M",
    name: '3/4" Minus Base Rock',
    category: "aggregate",
    soldBy: "ton",
    densityTonsPerYard: 1.4,
    defaultDepthInches: 4,
    minDepthInches: 2,
    maxDepthInches: 12,
    blowable: false,
    compactionFactor: 1.2,
    minIncrementYards: 0.5,
    pricePerUnit: 55,
  },
  {
    id: "agg-drain-rock",
    sku: "AGG-DRAIN",
    name: "1\" Drain Rock",
    category: "aggregate",
    soldBy: "ton",
    densityTonsPerYard: 1.35,
    defaultDepthInches: 3,
    minDepthInches: 2,
    maxDepthInches: 12,
    blowable: false,
    minIncrementYards: 0.5,
    pricePerUnit: 58,
  },
  {
    id: "stone-decorative-cobble",
    sku: "STONE-COBBLE",
    name: "Decorative Cobble",
    category: "natural_stone",
    soldBy: "ton",
    densityTonsPerYard: 1.3,
    defaultDepthInches: 3,
    minDepthInches: 2,
    maxDepthInches: 6,
    blowable: false,
    minIncrementYards: 0.5,
    pricePerUnit: 95,
  },
];

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((product) => product.id === id);
}

export function getProductsByCategory(category: Product["category"]): Product[] {
  return PRODUCTS.filter((product) => product.category === category);
}
