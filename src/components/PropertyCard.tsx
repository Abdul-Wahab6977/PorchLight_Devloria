"use client";

import Link from "next/link";
import { useState } from "react";
import { Bath, Bed, Heart, Ruler, MapPin } from "lucide-react";
import type { PropertyWithExtras } from "@/lib/types";
import { formatPrice, formatSqft, PROPERTY_TYPE_LABELS, STATUS_LABELS } from "@/lib/format";
import { useAuth } from "@/context/AuthContext";

const STATUS_STYLE: Record<string, string> = {
  FOR_SALE: "text-moss-500",
  PENDING: "text-amber-600",
  SOLD: "text-clay-500",
};

export function PropertyCard({ property }: { property: PropertyWithExtras }) {
  const { user } = useAuth();
  const [favorited, setFavorited] = useState(!!property.is_favorited);
  const [busy, setBusy] = useState(false);
  const cover = property.images[0]?.url;

  async function toggleFavorite(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!user || busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId: property.id }),
      });
      const data = await res.json();
      setFavorited(data.favorited);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Link
      href={`/listings/${property.id}`}
      className="card group block overflow-hidden transition-shadow hover:shadow-card"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-ink-100">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt={property.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-ink-300">
            <MapPin size={28} />
          </div>
        )}

        <span className={`tag absolute left-3 top-3 border-none bg-paper-soft/90 ${STATUS_STYLE[property.status]}`}>
          {STATUS_LABELS[property.status]}
        </span>

        {user && (
          <button
            onClick={toggleFavorite}
            aria-label={favorited ? "Remove from favorites" : "Save to favorites"}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-paper-soft/90 text-ink-700 transition hover:scale-105"
          >
            <Heart size={16} className={favorited ? "fill-clay-500 text-clay-500" : ""} />
          </button>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-baseline justify-between gap-2">
          <span className="font-mono text-lg font-medium text-ink-900">
            {formatPrice(property.price)}
          </span>
          <span className="tag border-none px-0 text-ink-400">
            {PROPERTY_TYPE_LABELS[property.property_type]}
          </span>
        </div>

        <h3 className="mt-1.5 truncate font-display text-base text-ink-800">{property.title}</h3>
        <p className="mt-0.5 flex items-center gap-1 truncate text-sm text-ink-500">
          <MapPin size={13} /> {property.city}, {property.state}
        </p>

        <div className="mt-3 flex items-center gap-4 text-sm text-ink-600">
          <span className="flex items-center gap-1">
            <Bed size={14} /> {property.bedrooms}
          </span>
          <span className="flex items-center gap-1">
            <Bath size={14} /> {property.bathrooms}
          </span>
          <span className="flex items-center gap-1">
            <Ruler size={14} /> {formatSqft(property.sqft)}
          </span>
        </div>
      </div>
    </Link>
  );
}
