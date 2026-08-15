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
          aria-label="Property address"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && search()}
          className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400"
        />
        <button
          type="button"
          onClick={search}
          disabled={status === "loading" || query.trim().length < 3}
          className="rounded-lg bg-green-700 px-4 py-2 font-medium text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status === "loading" ? "Finding…" : "Find"}
        </button>
      </div>
      {status === "error" && (
        <p role="alert" className="text-sm text-red-700">
          Couldn&apos;t look that up. You can still trace the map manually or
          type dimensions below.
        </p>
      )}
      {candidates.length > 0 && (
        <ul className="flex flex-col overflow-hidden rounded-lg border border-slate-200 text-sm">
          {candidates.map((candidate) => (
            <li key={`${candidate.lat}-${candidate.lng}`} className="border-b border-slate-100 last:border-b-0">
              <button
                type="button"
                onClick={() => {
                  onSelect(candidate);
                  setCandidates([]);
                  setQuery(candidate.formattedAddress);
                }}
                className="w-full bg-white px-3 py-2 text-left text-slate-900 hover:bg-slate-50"
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
