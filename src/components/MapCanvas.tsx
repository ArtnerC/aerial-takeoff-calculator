"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import maplibregl, { Map as MLMap, Marker } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { polygonAreaSqFt, toClosedPolygon } from "@/lib/geometry/polygon-area";
import { roundTo } from "@/lib/calc-engine";

const DEFAULT_CENTER: [number, number] = [-122.9452682, 42.4081702]; // Ground Control yard, Central Point OR
// Esri's free World Imagery layer has real high-res photography only in
// well-mapped areas; many addresses show "Map data not yet available"
// placeholder tiles above ~zoom 16-17. Starting lower makes a usable image
// more likely; see the zoom-out hint under the map and SPEC.md §8.
const DEFAULT_ZOOM = 17;

/**
 * Free demo raster source. Swap for a licensed Mapbox/Maptiler satellite
 * style before launch — see SPEC.md §8 (map layer).
 */
const SATELLITE_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    satellite: {
      type: "raster",
      tiles: [
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      ],
      tileSize: 256,
      attribution: "Esri World Imagery",
    },
  },
  layers: [
    {
      id: "satellite",
      type: "raster",
      source: "satellite",
    },
  ],
};

function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      canvas.getContext("webgl2") ||
        canvas.getContext("webgl") ||
        canvas.getContext("experimental-webgl")
    );
  } catch {
    return false;
  }
}

export interface DrawnArea {
  points: [number, number][];
  areaSqFt: number;
}

interface MapCanvasProps {
  onAreaChange: (area: DrawnArea | null) => void;
  center?: [number, number];
}

export function MapCanvas({ onAreaChange, center = DEFAULT_CENTER }: MapCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MLMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const pointsRef = useRef<[number, number][]>([]);
  const [points, setPoints] = useState<[number, number][]>([]);
  const [isDrawing, setIsDrawing] = useState(true);
  const [tilesLoaded, setTilesLoaded] = useState(false);
  const [clearedByRecentre, setClearedByRecentre] = useState(false);
  // Must start null: this component is prerendered on the server, where WebGL
  // never exists, so probing during render bakes a false failure into the HTML.
  const [mapError, setMapError] = useState<string | null>(null);
  const isDrawingRef = useRef(isDrawing);
  useEffect(() => {
    isDrawingRef.current = isDrawing;
  }, [isDrawing]);
  // Lets marker drag handlers call the latest commitPoints without a
  // circular useCallback dependency between redraw and commitPoints.
  const commitPointsRef = useRef<(points: [number, number][]) => void>(() => {});

  const redraw = useCallback((nextPoints: [number, number][]) => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = nextPoints.map(([lng, lat], index) => {
      const marker = new maplibregl.Marker({
        color: "#16a34a",
        scale: 0.6,
        draggable: true,
      })
        .setLngLat([lng, lat])
        .addTo(map);

      marker.on("dragend", () => {
        const { lng: draggedLng, lat: draggedLat } = marker.getLngLat();
        const updated = [...pointsRef.current];
        updated[index] = [draggedLng, draggedLat];
        commitPointsRef.current(updated);
      });

      return marker;
    });

    const source = map.getSource("drawn-area") as maplibregl.GeoJSONSource | undefined;
    if (!source) return;

    if (nextPoints.length < 2) {
      source.setData({ type: "FeatureCollection", features: [] });
      return;
    }

    const lineFeature: GeoJSON.Feature = {
      type: "Feature",
      properties: {},
      geometry: { type: "LineString", coordinates: nextPoints },
    };

    const features: GeoJSON.Feature[] = [lineFeature];

    if (nextPoints.length >= 3) {
      const polygon = toClosedPolygon(nextPoints);
      features.push({
        type: "Feature",
        properties: {},
        geometry: polygon,
      });
    }

    source.setData({ type: "FeatureCollection", features });
  }, []);

  const commitPoints = useCallback(
    (nextPoints: [number, number][]) => {
      pointsRef.current = nextPoints;
      setPoints(nextPoints);
      redraw(nextPoints);

      if (nextPoints.length >= 3) {
        const polygon = toClosedPolygon(nextPoints);
        const areaSqFt = roundTo(polygonAreaSqFt(polygon), 1);
        onAreaChange({ points: nextPoints, areaSqFt });
      } else {
        onAreaChange(null);
      }
    },
    [onAreaChange, redraw]
  );

  useEffect(() => {
    commitPointsRef.current = commitPoints;
  }, [commitPoints]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current || mapError) return;

    if (!isWebGLAvailable()) {
      queueMicrotask(() =>
        setMapError(
          "This browser can't display the map (WebGL is unavailable). Use \"Type dimensions\" above instead."
        )
      );
      return;
    }

    let map: MLMap;
    try {
      map = new maplibregl.Map({
        container: containerRef.current,
        style: SATELLITE_STYLE,
        center,
        zoom: DEFAULT_ZOOM,
        attributionControl: {},
      });
    } catch {
      // Deferred so the state update happens outside the effect's synchronous execution.
      queueMicrotask(() =>
        setMapError("The map failed to start. Use \"Type dimensions instead\" below.")
      );
      return;
    }

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

    map.on("load", () => {
      setTilesLoaded(true);
      map.addSource("drawn-area", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });
      map.addLayer({
        id: "drawn-area-fill",
        type: "fill",
        source: "drawn-area",
        filter: ["==", "$type", "Polygon"],
        paint: { "fill-color": "#16a34a", "fill-opacity": 0.25 },
      });
      map.addLayer({
        id: "drawn-area-outline",
        type: "line",
        source: "drawn-area",
        paint: { "line-color": "#16a34a", "line-width": 2 },
      });
    });

    map.on("error", (e) => {
      // Tile/network failures land here — surface it instead of a silent blank map.
      setMapError(
        "Satellite imagery couldn't load. You can still trace by typing dimensions below."
      );
      console.error("Map error:", e.error?.message ?? e);
    });

    map.on("click", (event) => {
      if (!isDrawingRef.current) return;
      const next: [number, number][] = [
        ...pointsRef.current,
        [event.lngLat.lng, event.lngLat.lat],
      ];
      commitPoints(next);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The map instance is created once, so a later address selection has to be
  // pushed into it explicitly or the view stays on the initial centre.
  const [centerLng, centerLat] = center;
  const hasCenteredRef = useRef(false);
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (!hasCenteredRef.current) {
      hasCenteredRef.current = true;
      return;
    }
    const target = { center: [centerLng, centerLat] as [number, number], zoom: DEFAULT_ZOOM };
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) {
      map.jumpTo(target);
    } else {
      map.flyTo({ ...target, duration: 1200 });
    }

    // A trace drawn at the previous location no longer matches what's on
    // screen, so drop it rather than let it feed a misleading estimate.
    if (pointsRef.current.length > 0) {
      queueMicrotask(() => {
        commitPointsRef.current([]);
        setIsDrawing(true);
        setClearedByRecentre(true);
      });
    }
  }, [centerLng, centerLat]);

  const handleUndo = () => {
    commitPoints(pointsRef.current.slice(0, -1));
  };

  const handleClear = () => {
    commitPoints([]);
    setIsDrawing(true);
  };

  const handleFinish = () => {
    if (points.length >= 3) {
      setIsDrawing(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="relative h-[420px] w-full overflow-hidden rounded-lg border border-slate-200">
        <div ref={containerRef} className="h-full w-full" />
        {mapError && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100 p-4 text-center text-sm text-slate-700">
            {mapError}
          </div>
        )}
        {!mapError && !tilesLoaded && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-slate-100/80 text-sm text-slate-600">
            Loading satellite imagery…
          </div>
        )}
      </div>
      {!mapError && (
        <p className="text-xs text-slate-500">
          Imagery looking blank or gray? Zoom out with the − button — high-res
          satellite detail isn&apos;t available everywhere yet.
        </p>
      )}
      {clearedByRecentre && points.length === 0 && (
        <p
          role="status"
          className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900"
        >
          Map moved to your new address, so the previous trace was cleared.
          Trace the area again here.
        </p>
      )}
      <p className="text-sm text-slate-600">
        {isDrawing
          ? "Tap the map to trace the edge of the area. Add at least 3 points. Drag a point to adjust it."
          : "Area closed. Drag a point to adjust it, or edit below."}
      </p>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <button
          type="button"
          onClick={handleUndo}
          disabled={points.length === 0}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 font-medium text-slate-900 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Undo point
        </button>
        <button
          type="button"
          onClick={handleClear}
          disabled={points.length === 0}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 font-medium text-slate-900 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={isDrawing ? handleFinish : () => setIsDrawing(true)}
          disabled={points.length < 3}
          className="rounded-lg bg-green-700 px-3 py-2 font-medium text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isDrawing ? "Finish area" : "Edit area"}
        </button>
      </div>
    </div>
  );
}
