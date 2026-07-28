"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Heart, LayoutDashboard, LogOut, Menu, Search, User, X } from "lucide-react";
import { Logo } from "./Logo";
import { useAuth } from "@/context/AuthContext";

export function Navbar() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    await logout();
    setOpen(false);
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-paper-line bg-paper-soft/90 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
        <Link href="/" className="shrink-0">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-medium text-ink-600 md:flex">
          <Link href="/listings" className="flex items-center gap-1.5 hover:text-ink-900">
            <Search size={15} strokeWidth={2} />
            Browse listings
          </Link>
          {user?.role === "AGENT" && (
            <Link href="/dashboard/agent" className="flex items-center gap-1.5 hover:text-ink-900">
              <LayoutDashboard size={15} strokeWidth={2} />
              Agent dashboard
            </Link>
          )}
          {user?.role === "BUYER" && (
            <Link href="/dashboard/buyer" className="flex items-center gap-1.5 hover:text-ink-900">
              <Heart size={15} strokeWidth={2} />
              Saved
            </Link>
          )}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {loading ? null : user ? (
            <>
              <span className="flex items-center gap-2 text-sm text-ink-600">
                <span className="beacon is-live" />
                {user.name.split(" ")[0]}
              </span>
              <button onClick={handleLogout} className="btn btn-ghost">
                <LogOut size={15} /> Sign out
              </button>
              {user.role === "AGENT" && (
                <Link href="/dashboard/agent/properties/new" className="btn btn-amber">
                  + New listing
                </Link>
              )}
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost">
                Sign in
              </Link>
              <Link href="/register" className="btn btn-primary">
                Get started
              </Link>
            </>
          )}
        </div>

        <button
          className="text-ink-700 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-paper-line bg-paper-soft px-5 pb-5 pt-3 md:hidden">
          <div className="flex flex-col gap-3 text-sm font-medium text-ink-700">
            <Link href="/listings" onClick={() => setOpen(false)}>
              Browse listings
            </Link>
            {user?.role === "AGENT" && (
              <Link href="/dashboard/agent" onClick={() => setOpen(false)}>
                Agent dashboard
              </Link>
            )}
            {user?.role === "BUYER" && (
              <Link href="/dashboard/buyer" onClick={() => setOpen(false)}>
                Saved homes & searches
              </Link>
            )}
            <div className="hairline my-1" />
            {user ? (
              <>
                <span className="flex items-center gap-2 text-ink-500">
                  <User size={15} /> {user.name} · {user.role.toLowerCase()}
                </span>
                {user.role === "AGENT" && (
                  <Link href="/dashboard/agent/properties/new" onClick={() => setOpen(false)} className="btn btn-amber w-fit">
                    + New listing
                  </Link>
                )}
                <button onClick={handleLogout} className="btn btn-ghost w-fit">
                  <LogOut size={15} /> Sign out
                </button>
              </>
            ) : (
              <div className="flex gap-3">
                <Link href="/login" onClick={() => setOpen(false)} className="btn btn-ghost">
                  Sign in
                </Link>
                <Link href="/register" onClick={() => setOpen(false)} className="btn btn-primary">
                  Get started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
