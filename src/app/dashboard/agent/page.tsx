"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Home, Inbox, Pencil, Plus, Trash2, TrendingUp } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { formatFullPrice, formatRelativeDate, STATUS_LABELS } from "@/lib/format";
import type { Inquiry, PropertyWithExtras } from "@/lib/types";

interface DashboardData {
  properties: PropertyWithExtras[];
  inquiries: (Inquiry & { property_title: string })[];
  stats: {
    totalListings: number;
    activeListings: number;
    totalInquiries: number;
    newInquiries: number;
    portfolioValue: number;
  };
  inquiryCounts: Record<string, number>;
}

const STATUS_STYLE: Record<string, string> = {
  FOR_SALE: "text-moss-500 border-moss-500",
  PENDING: "text-amber-600 border-amber-500",
  SOLD: "text-clay-500 border-clay-500",
};

export default function AgentDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"listings" | "inquiries">("listings");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/dashboard/agent");
    if (res.ok) setData(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    if (user?.role === "AGENT" || user?.role === "ADMIN") load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function deleteProperty(id: string) {
    if (!confirm("Delete this listing? This cannot be undone.")) return;
    await fetch(`/api/properties/${id}`, { method: "DELETE" });
    load();
  }

  async function setInquiryStatus(id: string, status: Inquiry["status"]) {
    await fetch(`/api/inquiries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  }

  if (authLoading) return null;
  if (!user || (user.role !== "AGENT" && user.role !== "ADMIN")) {
    return (
      <div className="container-page py-24 text-center">
        <p className="text-ink-500">This dashboard is for agent accounts.</p>
        <Link href="/login" className="btn btn-primary mt-4 inline-flex">Sign in as an agent</Link>
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="field-label">Agent dashboard</span>
          <h1 className="font-display text-3xl text-ink-900">Hi {user.name.split(" ")[0]}, here&apos;s your pipeline</h1>
        </div>
        <Link href="/dashboard/agent/properties/new" className="btn btn-amber">
          <Plus size={16} /> New listing
        </Link>
      </div>

      {loading || !data ? (
        <p className="mt-10 text-sm text-ink-400">Loading dashboard…</p>
      ) : (
        <>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-5">
            <StatCard icon={<Home size={16} />} label="Total listings" value={String(data.stats.totalListings)} />
            <StatCard icon={<TrendingUp size={16} />} label="Active" value={String(data.stats.activeListings)} />
            <StatCard icon={<Inbox size={16} />} label="Total inquiries" value={String(data.stats.totalInquiries)} />
            <StatCard icon={<Inbox size={16} />} label="New inquiries" value={String(data.stats.newInquiries)} highlight />
            <StatCard icon={<TrendingUp size={16} />} label="Portfolio value" value={formatFullPrice(data.stats.portfolioValue)} />
          </div>

          <div className="mt-10 flex gap-1 border-b border-paper-line">
            {(["listings", "inquiries"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2.5 text-sm font-medium capitalize transition ${
                  tab === t ? "border-b-2 border-amber-400 text-ink-900" : "text-ink-400"
                }`}
              >
                {t} {t === "inquiries" && data.stats.newInquiries > 0 && (
                  <span className="ml-1 rounded-full bg-clay-500 px-1.5 py-0.5 text-[10px] text-white">
                    {data.stats.newInquiries}
                  </span>
                )}
              </button>
            ))}
          </div>

          {tab === "listings" && (
            <div className="mt-6 overflow-x-auto">
              {data.properties.length === 0 ? (
                <p className="rounded-lg border border-dashed border-paper-line p-10 text-center text-ink-400">
                  You haven&apos;t listed any properties yet.
                </p>
              ) : (
                <table className="w-full min-w-[640px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-paper-line text-left text-xs uppercase tracking-wide text-ink-400">
                      <th className="py-3 pr-3">Property</th>
                      <th className="py-3 pr-3">Status</th>
                      <th className="py-3 pr-3">Price</th>
                      <th className="py-3 pr-3">Inquiries</th>
                      <th className="py-3 pr-3">Listed</th>
                      <th className="py-3 pr-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.properties.map((p) => (
                      <tr key={p.id} className="border-b border-paper-line/70">
                        <td className="py-3 pr-3">
                          <Link href={`/listings/${p.id}`} className="font-medium text-ink-800 hover:text-amber-600">
                            {p.title}
                          </Link>
                          <p className="text-xs text-ink-400">{p.city}, {p.state}</p>
                        </td>
                        <td className="py-3 pr-3">
                          <span className={`tag ${STATUS_STYLE[p.status]}`}>{STATUS_LABELS[p.status]}</span>
                        </td>
                        <td className="py-3 pr-3 font-mono">{formatFullPrice(p.price)}</td>
                        <td className="py-3 pr-3">{data.inquiryCounts[p.id] ?? 0}</td>
                        <td className="py-3 pr-3 text-ink-400">{formatRelativeDate(p.created_at)}</td>
                        <td className="py-3 pr-3">
                          <div className="flex justify-end gap-2">
                            <Link href={`/dashboard/agent/properties/${p.id}/edit`} className="btn btn-ghost !px-2 !py-1.5">
                              <Pencil size={14} />
                            </Link>
                            <button onClick={() => deleteProperty(p.id)} className="btn btn-danger !px-2 !py-1.5">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {tab === "inquiries" && (
            <div className="mt-6 space-y-3">
              {data.inquiries.length === 0 ? (
                <p className="rounded-lg border border-dashed border-paper-line p-10 text-center text-ink-400">
                  No inquiries yet — they&apos;ll show up here as soon as a buyer reaches out.
                </p>
              ) : (
                data.inquiries.map((inq) => (
                  <div key={inq.id} className="card p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-ink-800">
                          {inq.name}{" "}
                          <span className="font-normal text-ink-400">→ {inq.property_title}</span>
                        </p>
                        <p className="text-xs text-ink-400">
                          {inq.email}{inq.phone ? ` · ${inq.phone}` : ""} · {formatRelativeDate(inq.created_at)}
                        </p>
                        <p className="mt-2 text-sm text-ink-600">{inq.message}</p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-2">
                        <span
                          className={`tag ${
                            inq.status === "NEW"
                              ? "border-clay-500 text-clay-500"
                              : inq.status === "READ"
                              ? "border-amber-500 text-amber-600"
                              : "border-moss-500 text-moss-500"
                          }`}
                        >
                          {inq.status}
                        </span>
                        <div className="flex gap-1.5">
                          {inq.status !== "READ" && (
                            <button onClick={() => setInquiryStatus(inq.id, "READ")} className="text-xs text-ink-500 hover:text-ink-900">
                              Mark read
                            </button>
                          )}
                          {inq.status !== "RESPONDED" && (
                            <button onClick={() => setInquiryStatus(inq.id, "RESPONDED")} className="text-xs text-ink-500 hover:text-ink-900">
                              Mark responded
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, highlight }: { icon: React.ReactNode; label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`card p-4 ${highlight ? "border-amber-400 bg-amber-50" : ""}`}>
      <div className="flex items-center gap-1.5 text-ink-400">
        {icon}
        <span className="text-[11px] uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-1.5 font-display text-xl text-ink-900">{value}</p>
    </div>
  );
}
