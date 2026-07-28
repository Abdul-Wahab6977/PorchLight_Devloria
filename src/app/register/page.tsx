"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Building2, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import type { Role } from "@/lib/auth";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("BUYER");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { refresh } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      await refresh();
      router.push(role === "AGENT" ? "/dashboard/agent" : "/dashboard/buyer");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-16">
      <div className="card w-full max-w-sm p-8">
        <span className="beacon is-live" />
        <h1 className="mt-3 font-display text-2xl text-ink-900">Create your account</h1>
        <p className="mt-1 text-sm text-ink-500">Buy, save, or list — tell us which you&apos;re here for.</p>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setRole("BUYER")}
            className={`flex flex-col items-center gap-1.5 rounded-md border p-3 text-sm transition ${
              role === "BUYER" ? "border-amber-400 bg-amber-50 text-ink-900" : "border-paper-line text-ink-500"
            }`}
          >
            <User size={18} /> I&apos;m buying
          </button>
          <button
            type="button"
            onClick={() => setRole("AGENT")}
            className={`flex flex-col items-center gap-1.5 rounded-md border p-3 text-sm transition ${
              role === "AGENT" ? "border-amber-400 bg-amber-50 text-ink-900" : "border-paper-line text-ink-500"
            }`}
          >
            <Building2 size={18} /> I&apos;m an agent
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="field-label" htmlFor="name">Full name</label>
            <input id="name" required className="field-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jordan Rivera" />
          </div>
          <div>
            <label className="field-label" htmlFor="email">Email</label>
            <input id="email" type="email" required className="field-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <div>
            <label className="field-label" htmlFor="password">Password</label>
            <input id="password" type="password" required minLength={6} className="field-input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" />
          </div>

          {error && <p className="text-sm text-clay-500">{error}</p>}

          <button type="submit" disabled={loading} className="btn btn-primary w-full">
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-500">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-amber-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
