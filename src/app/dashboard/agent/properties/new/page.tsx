"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { PropertyForm } from "@/components/PropertyForm";

export default function NewPropertyPage() {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user || (user.role !== "AGENT" && user.role !== "ADMIN")) {
    return (
      <div className="container-page py-24 text-center">
        <p className="text-ink-500">Only agent accounts can create listings.</p>
        <Link href="/login" className="btn btn-primary mt-4 inline-flex">Sign in as an agent</Link>
      </div>
    );
  }

  return (
    <div className="container-page max-w-3xl py-10">
      <span className="field-label">New listing</span>
      <h1 className="font-display text-3xl text-ink-900">Publish a property</h1>
      <p className="mt-2 text-ink-500">This goes live on Porchlight immediately and is searchable right away.</p>
      <div className="mt-8">
        <PropertyForm />
      </div>
    </div>
  );
}
