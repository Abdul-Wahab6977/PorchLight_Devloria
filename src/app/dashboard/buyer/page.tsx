"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Heart, Search, Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { PropertyCard } from "@/components/PropertyCard";
import type { PropertyWithExtras, SearchCriteria } from "@/lib/types";
import { PROPERTY_TYPE_LABELS } from "@/lib/format";

interface SavedSearchRow {
  id: string;
  name: string;
  criteria: SearchCriteria;
  matchCount: number;
  created_at: string;
}

export default function BuyerDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [favorites, setFavorites] = useState<PropertyWithExtras[]>([]);
  const [searches, setSearches] = useState<SavedSearchRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      fetch("/api/favorites").then((r) => r.json()),
      fetch("/api/saved-searches").then((r) => r.json()),
    ])
      .then(([favData, searchData]) => {
        setFavorites(favData.favorites ?? []);
        setSearches(searchData.searches ?? []);
      })
      .finally(() => setLoading(false));
  }, [user]);

  async function removeSearch(id: string) {
    setSearches((prev) => prev.filter((s) => s.id !== id));
    await fetch(`/api/saved-searches/${id}`, { method: "DELETE" });
  }

  function searchHref(criteria: SearchCriteria) {
    const params = new URLSearchParams();
    Object.entries(criteria).forEach(([k, v]) => {
      if (v === undefined || v === null || v === "" || v === "ANY") return;
      params.set(k, String(v));
    });
    return `/listings?${params.toString()}`;
  }

  function summarize(criteria: SearchCriteria) {
    const bits: string[] = [];
    if (criteria.city) bits.push(criteria.city);
    if (criteria.propertyType && criteria.propertyType !== "ANY") bits.push(PROPERTY_TYPE_LABELS[criteria.propertyType]);
    if (criteria.minPrice) bits.push(`$${criteria.minPrice.toLocaleString()}+`);
    if (criteria.maxPrice) bits.push(`under $${criteria.maxPrice.toLocaleString()}`);
    if (criteria.minBeds) bits.push(`${criteria.minBeds}+ bd`);
    return bits.length ? bits.join(" · ") : "All listings";
  }

  if (authLoading) return null;
  if (!user) {
    return (
      <div className="container-page py-24 text-center">
        <p className="text-ink-500">Sign in to see your saved homes and searches.</p>
        <Link href="/login" className="btn btn-primary mt-4 inline-flex">Sign in</Link>
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <span className="field-label">Your dashboard</span>
      <h1 className="font-display text-3xl text-ink-900">Welcome back, {user.name.split(" ")[0]}</h1>

      <section className="mt-10">
        <h2 className="flex items-center gap-2 font-display text-xl text-ink-900">
          <Search size={18} className="text-amber-500" /> Saved searches
        </h2>
        {loading ? (
          <p className="mt-3 text-sm text-ink-400">Loading…</p>
        ) : searches.length === 0 ? (
          <p className="mt-3 rounded-lg border border-dashed border-paper-line p-6 text-sm text-ink-400">
            Save a search from the listings page to get notified how many homes match.
          </p>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {searches.map((s) => (
              <div key={s.id} className="card flex flex-col justify-between p-4">
                <div>
                  <div className="flex items-center justify-between">
                    <p className="font-display text-base text-ink-900">{s.name}</p>
                    <button onClick={() => removeSearch(s.id)} className="text-ink-300 hover:text-clay-500" aria-label="Delete saved search">
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-ink-400">{summarize(s.criteria)}</p>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="tag border-amber-400 text-amber-600">
                    {s.matchCount} match{s.matchCount === 1 ? "" : "es"}
                  </span>
                  <Link href={searchHref(s.criteria)} className="text-sm font-medium text-ink-700 hover:text-amber-600">
                    View →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-12">
        <h2 className="flex items-center gap-2 font-display text-xl text-ink-900">
          <Heart size={18} className="text-clay-500" /> Favorite homes
        </h2>
        {loading ? (
          <p className="mt-3 text-sm text-ink-400">Loading…</p>
        ) : favorites.length === 0 ? (
          <p className="mt-3 rounded-lg border border-dashed border-paper-line p-6 text-sm text-ink-400">
            Tap the heart on any listing to save it here.
          </p>
        ) : (
          <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
