import Link from "next/link";
import { ArrowRight, BellRing, Search, ShieldCheck } from "lucide-react";
import { searchProperties } from "@/lib/queries";
import { PropertyCard } from "@/components/PropertyCard";
import { HomeSearchBar } from "@/components/HomeSearchBar";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { results: featured } = await searchProperties({ sort: "newest", pageSize: 6 });

  return (
    <div>
      <section className="border-b border-paper-line bg-paper-soft">
        <div className="container-page grid gap-10 py-16 md:grid-cols-2 md:py-24">
          <div className="animate-rise">
            <span className="tag border-amber-400 text-amber-600">
              <span className="beacon is-live" /> New listings lit up daily
            </span>
            <h1 className="mt-5 font-display text-[2.6rem] leading-[1.05] text-ink-900 md:text-6xl">
              Find the home with its <em className="italic text-amber-500">porch light</em> on.
            </h1>
            <p className="mt-5 max-w-md text-[1.05rem] leading-relaxed text-ink-500">
              Porchlight is a calmer way to search real estate — real listings, transparent
              filters, and a direct line to the agent who actually knows the property.
            </p>
            <div className="mt-8">
              <HomeSearchBar />
            </div>
            <div className="mt-6 flex items-center gap-6 text-sm text-ink-500">
              <span>452 active listings</span>
              <span className="h-1 w-1 rounded-full bg-ink-300" />
              <span>38 verified agents</span>
            </div>
          </div>

          <div className="relative hidden md:block">
            <div className="absolute inset-0 -z-10 translate-x-6 translate-y-6 rounded-lg bg-amber-100" />
            <div className="card overflow-hidden">
              {featured[0]?.images[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={featured[0].images[0].url}
                  alt=""
                  className="h-[420px] w-full object-cover"
                />
              ) : (
                <div className="flex h-[420px] items-center justify-center text-ink-300">
                  Porchlight
                </div>
              )}
              <div className="flex items-center justify-between border-t border-paper-line p-4">
                <span className="font-mono text-sm text-ink-800">
                  {featured[0] ? `$${featured[0].price.toLocaleString()}` : "—"}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-moss-500">
                  <span className="beacon is-live" /> Just listed
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <div className="grid gap-8 md:grid-cols-3">
          {[
            {
              icon: Search,
              title: "Search that respects filters",
              body: "Location, price, beds, baths and type all query a real, indexed database — not a static mock.",
            },
            {
              icon: BellRing,
              title: "Save a search, not just a home",
              body: "Save your exact criteria and see how many listings match it right now, from your dashboard.",
            },
            {
              icon: ShieldCheck,
              title: "One inquiry, straight to the agent",
              body: "Every inquiry notifies the listing agent and lands in their dashboard with your contact details.",
            },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="card p-6">
              <Icon className="text-amber-500" size={22} strokeWidth={1.6} />
              <h3 className="mt-4 font-display text-lg text-ink-800">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-500">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page pb-20">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <span className="field-label">Fresh on Porchlight</span>
            <h2 className="font-display text-2xl text-ink-900">Newest listings</h2>
          </div>
          <Link href="/listings" className="hidden items-center gap-1 text-sm font-medium text-ink-700 hover:text-amber-600 md:flex">
            View all listings <ArrowRight size={15} />
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
        {featured.length === 0 && (
          <p className="rounded-lg border border-dashed border-paper-line p-10 text-center text-ink-400">
            No listings yet — run the seed script or list the first property as an agent.
          </p>
        )}
      </section>

      <section className="border-t border-paper-line bg-ink-900 text-paper">
        <div className="container-page flex flex-col items-start justify-between gap-6 py-16 md:flex-row md:items-center">
          <div>
            <h2 className="font-display text-3xl">Are you the agent for one of these homes?</h2>
            <p className="mt-2 max-w-md text-ink-200">
              List your properties, track every inquiry, and manage your pipeline from a single
              dashboard — free while you&apos;re building your portfolio.
            </p>
          </div>
          <Link href="/register" className="btn btn-amber shrink-0">
            List a property <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
