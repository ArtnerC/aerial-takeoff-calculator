import { milesFromYard } from "./distance";

export interface GeocodeCandidate {
  lat: number;
  lng: number;
  formattedAddress: string;
  distanceMilesFromYard: number;
}

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

/**
 * Calls Nominatim directly from the browser. Used by the static/GitHub Pages
 * build, which has no server to proxy through — see SPEC.md §8. The
 * dynamic/production deployment should restore the server-side proxy
 * (rate limiting, hidden User-Agent) that lives at src/app/api/geocode.
 */
export async function geocodeAddress(query: string): Promise<GeocodeCandidate[]> {
  const trimmed = query.trim();
  if (trimmed.length < 3) return [];

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", trimmed);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "5");
  // Bias toward Southern Oregon, Ground Control's service area.
  url.searchParams.set("viewbox", "-123.4,42.0,-122.5,42.7");
  url.searchParams.set("bounded", "0");

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error("Geocoding provider error");
  }

  const results = (await response.json()) as NominatimResult[];

  return results.map((result) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    return {
      lat,
      lng,
      formattedAddress: result.display_name,
      distanceMilesFromYard: Math.round(milesFromYard(lng, lat) * 10) / 10,
    };
  });
}
