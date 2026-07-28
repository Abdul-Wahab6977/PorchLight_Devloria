"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { PropertyForm } from "@/components/PropertyForm";
import type { PropertyWithExtras } from "@/lib/types";

export default function EditPropertyPage() {
  const { user, loading: authLoading } = useAuth();
  const params = useParams<{ id: string }>();
  const [property, setProperty] = useState<PropertyWithExtras | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/properties/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setProperty(data.property);
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  if (authLoading || loading) return null;

  if (!user || (user.role !== "AGENT" && user.role !== "ADMIN")) {
    return (
      <div className="container-page py-24 text-center">
        <p className="text-ink-500">Only agent accounts can edit listings.</p>
        <Link href="/login" className="btn btn-primary mt-4 inline-flex">Sign in as an agent</Link>
      </div>
    );
  }

  if (error || !property) {
    return <div className="container-page py-24 text-center text-ink-500">{error ?? "Listing not found."}</div>;
  }

  if (property.agent_id !== user.id && user.role !== "ADMIN") {
    return <div className="container-page py-24 text-center text-ink-500">You can only edit your own listings.</div>;
  }

  return (
    <div className="container-page max-w-3xl py-10">
      <span className="field-label">Edit listing</span>
      <h1 className="font-display text-3xl text-ink-900">{property.title}</h1>
      <div className="mt-8">
        <PropertyForm initial={property} propertyId={property.id} />
      </div>
    </div>
  );
}
