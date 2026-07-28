"use client";

import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import type { SearchCriteria } from "@/lib/types";

interface Props {
  criteria: SearchCriteria;
  onChange: (next: Partial<SearchCriteria>) => void;
  onReset: () => void;
}

const TYPES: { value: SearchCriteria["propertyType"]; label: string }[] = [
  { value: "ANY", label: "Any type" },
  { value: "SINGLE_FAMILY", label: "Single-family" },
  { value: "APARTMENT", label: "Apartment" },
  { value: "CONDO", label: "Condo" },
  { value: "TOWNHOUSE", label: "Townhouse" },
  { value: "LAND", label: "Land" },
];

export function SearchFilters({ criteria, onChange, onReset }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="card p-4">
      <div className="flex flex-wrap items-center gap-3">
        <input
          className="field-input max-w-[220px]"
          placeholder="City"
          value={criteria.city ?? ""}
          onChange={(e) => onChange({ city: e.target.value })}
        />
        <input
          className="field-input w-28"
          placeholder="Min $"
          type="number"
          value={criteria.minPrice ?? ""}
          onChange={(e) => onChange({ minPrice: e.target.value ? Number(e.target.value) : undefined })}
        />
        <input
          className="field-input w-28"
          placeholder="Max $"
          type="number"
          value={criteria.maxPrice ?? ""}
          onChange={(e) => onChange({ maxPrice: e.target.value ? Number(e.target.value) : undefined })}
        />
        <select
          className="field-input w-auto"
          value={criteria.propertyType ?? "ANY"}
          onChange={(e) => onChange({ propertyType: e.target.value as SearchCriteria["propertyType"] })}
        >
          {TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="btn btn-ghost"
        >
          <SlidersHorizontal size={15} /> More filters
        </button>

        <button type="button" onClick={onReset} className="ml-auto flex items-center gap-1 text-sm text-ink-400 hover:text-clay-500">
          <X size={14} /> Reset
        </button>
      </div>

      {open && (
        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-paper-line pt-4 sm:grid-cols-4">
          <div>
            <label className="field-label">Min beds</label>
            <select
              className="field-input"
              value={criteria.minBeds ?? ""}
              onChange={(e) => onChange({ minBeds: e.target.value ? Number(e.target.value) : undefined })}
            >
              <option value="">Any</option>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>{n}+</option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label">Min baths</label>
            <select
              className="field-input"
              value={criteria.minBaths ?? ""}
              onChange={(e) => onChange({ minBaths: e.target.value ? Number(e.target.value) : undefined })}
            >
              <option value="">Any</option>
              {[1, 2, 3, 4].map((n) => (
                <option key={n} value={n}>{n}+</option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label">Status</label>
            <select
              className="field-input"
              value={criteria.status ?? "ANY"}
              onChange={(e) => onChange({ status: e.target.value as SearchCriteria["status"] })}
            >
              <option value="ANY">Any status</option>
              <option value="FOR_SALE">For sale</option>
              <option value="PENDING">Pending</option>
              <option value="SOLD">Sold</option>
            </select>
          </div>
          <div>
            <label className="field-label">Sort by</label>
            <select
              className="field-input"
              value={criteria.sort ?? "newest"}
              onChange={(e) => onChange({ sort: e.target.value as SearchCriteria["sort"] })}
            >
              <option value="newest">Newest</option>
              <option value="price_asc">Price: low to high</option>
              <option value="price_desc">Price: high to low</option>
              <option value="sqft_desc">Largest sqft</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
