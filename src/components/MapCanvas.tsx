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
  const [mapError, setMapError] = useState<string | null>(() =>
    isWebGLAvailable()
      ? null
      : "This browser can't display the map (WebGL is unavailable). Use \"Type dimensions instead\" below."
  );
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
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-slate-600">
          {isDrawing
            ? "Tap the map to trace the edge of the area. Add at least 3 points. Drag a point to adjust it."
            : "Area closed. Drag a point to adjust it, or edit below."}
        </span>
        <button
          type="button"
          onClick={handleUndo}
          disabled={points.length === 0}
          className="rounded border border-slate-300 px-3 py-1 disabled:opacity-40"
        >
          Undo point
        </button>
        <button
          type="button"
          onClick={handleClear}
          disabled={points.length === 0}
          className="rounded border border-slate-300 px-3 py-1 disabled:opacity-40"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={isDrawing ? handleFinish : () => setIsDrawing(true)}
          disabled={points.length < 3}
          className="rounded bg-green-700 px-3 py-1 text-white disabled:opacity-40"
        >
          {isDrawing ? "Finish area" : "Edit area"}
        </button>
      </div>
    </div>
  );
}
