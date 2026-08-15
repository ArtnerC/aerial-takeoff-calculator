"use client";

import { useState } from "react";
import { geocodeAddress, type GeocodeCandidate } from "@/lib/geocode/nominatim";

export type { GeocodeCandidate };

interface AddressSearchProps {
  onSelect: (candidate: GeocodeCandidate) => void;
}

export function AddressSearch({ onSelect }: AddressSearchProps) {
  const [query, setQuery] = useState("");
  const [candidates, setCandidates] = useState<GeocodeCandidate[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  const search = async () => {
    if (query.trim().length < 3) return;
    setStatus("loading");
    try {
      const found = await geocodeAddress(query);
      setCandidates(found);
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Enter your address"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && search()}
          className="flex-1 rounded border border-slate-300 px-3 py-2"
        />
        <button
          type="button"
          onClick={search}
          className="rounded bg-green-700 px-4 py-2 text-white"
        >
          Find
        </button>
      </div>
      {status === "error" && (
        <p className="text-sm text-red-600">
          Couldn&apos;t look that up. You can still trace the map manually or
          type dimensions below.
        </p>
      )}
      {candidates.length > 0 && (
        <ul className="flex flex-col gap-1 rounded border border-slate-200 text-sm">
          {candidates.map((candidate) => (
            <li key={`${candidate.lat}-${candidate.lng}`}>
              <button
                type="button"
                onClick={() => {
                  onSelect(candidate);
                  setCandidates([]);
                  setQuery(candidate.formattedAddress);
                }}
                className="w-full px-3 py-2 text-left hover:bg-slate-50"
              >
                {candidate.formattedAddress}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
