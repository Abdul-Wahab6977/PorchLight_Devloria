"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BookmarkPlus, Loader2 } from "lucide-react";
import { SearchFilters } from "@/components/SearchFilters";
import { PropertyCard } from "@/components/PropertyCard";
import { useAuth } from "@/context/AuthContext";
import type { PropertyWithExtras, SearchCriteria } from "@/lib/types";

function criteriaFromParams(params: URLSearchParams): SearchCriteria {
  const num = (k: string) => (params.get(k) ? Number(params.get(k)) : undefined);
  return {
    q: params.get("q") ?? undefined,
    city: params.get("city") ?? undefined,
    minPrice: num("minPrice"),
    maxPrice: num("maxPrice"),
    propertyType: (params.get("propertyType") as SearchCriteria["propertyType"]) ?? "ANY",
    minBeds: num("minBeds"),
    minBaths: num("minBaths"),
    status: (params.get("status") as SearchCriteria["status"]) ?? "ANY",
    sort: (params.get("sort") as SearchCriteria["sort"]) ?? "newest",
    page: num("page") ?? 1,
  };
}

function ListingsInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [criteria, setCriteria] = useState<SearchCriteria>(() => criteriaFromParams(searchParams));
  const [results, setResults] = useState<PropertyWithExtras[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [savedName, setSavedName] = useState("");
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  useEffect(() => {
    setCriteria(criteriaFromParams(searchParams));
  }, [searchParams]);

  const syncUrl = useCallback(
    (next: SearchCriteria) => {
      const params = new URLSearchParams();
      Object.entries(next).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "" || value === "ANY") return;
        params.set(key, String(value));
      });
      router.push(`/listings?${params.toString()}`, { scroll: false });
    },
    [router]
  );

  function updateCriteria(patch: Partial<SearchCriteria>) {
    const next = { ...criteria, ...patch, page: 1 };
    setCriteria(next);
    syncUrl(next);
  }

  function resetCriteria() {
    const next: SearchCriteria = { sort: "newest", page: 1 };
    setCriteria(next);
    syncUrl(next);
  }

  function goToPage(page: number) {
    const next = { ...criteria, page };
    setCriteria(next);
    syncUrl(next);
  }

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const params = new URLSearchParams();
    Object.entries(criteria).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "" || value === "ANY") return;
      params.set(key, String(value));
    });

    fetch(`/api/properties?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setResults(data.results ?? []);
        setTotal(data.total ?? 0);
        setTotalPages(data.totalPages ?? 1);
      })
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(criteria)]);

  async function handleSaveSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!savedName.trim()) return;
    const res = await fetch("/api/saved-searches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: savedName.trim(), criteria }),
    });
    if (res.ok) {
      setSavedMsg(`Saved as "${savedName.trim()}" — find it in your dashboard.`);
      setSavedName("");
    }
  }

  return (
    <div className="container-page py-10">
      <div className="mb-6">
        <span className="field-label">Search</span>
        <h1 className="font-display text-3xl text-ink-900">Browse listings</h1>
      </div>

      <SearchFilters criteria={criteria} onChange={updateCriteria} onReset={resetCriteria} />

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-500">
          {loading ? "Searching…" : `${total} listing${total === 1 ? "" : "s"} match your filters`}
        </p>

        {user?.role === "BUYER" && (
          <form onSubmit={handleSaveSearch} className="flex items-center gap-2">
            <input
              className="field-input w-44"
              placeholder="Name this search"
              value={savedName}
              onChange={(e) => setSavedName(e.target.value)}
            />
            <button type="submit" className="btn btn-ghost">
              <BookmarkPlus size={15} /> Save search
            </button>
          </form>
        )}
      </div>
      {savedMsg && <p className="mt-2 text-sm text-moss-500">{savedMsg}</p>}

      <div className="mt-6">
        {loading ? (
          <div className="flex justify-center py-24 text-ink-300">
            <Loader2 className="animate-spin" size={28} />
          </div>
        ) : results.length === 0 ? (
          <div className="rounded-lg border border-dashed border-paper-line p-16 text-center text-ink-400">
            No listings match those filters yet. Try widening your search.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => goToPage(page)}
              className={`h-9 w-9 rounded-md text-sm font-medium transition ${
                page === (criteria.page ?? 1)
                  ? "bg-ink-800 text-paper-soft"
                  : "border border-paper-line text-ink-600 hover:border-ink-400"
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ListingsPage() {
  return (
    <Suspense fallback={<div className="py-24 text-center text-ink-300">Loading…</div>}>
      <ListingsInner />
    </Suspense>
  );
}
