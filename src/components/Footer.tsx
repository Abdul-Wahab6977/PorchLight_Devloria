import Link from "next/link";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-paper-line bg-paper-soft">
      <div className="container-page grid gap-10 py-14 md:grid-cols-4">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-500">
            A quieter way to find home — real listings, real agents, and a search that respects
            your time.
          </p>
        </div>
        <div>
          <h4 className="field-label">Explore</h4>
          <ul className="mt-3 space-y-2 text-sm text-ink-600">
            <li><Link href="/listings" className="hover:text-ink-900">Browse listings</Link></li>
            <li><Link href="/listings?propertyType=SINGLE_FAMILY" className="hover:text-ink-900">Single-family homes</Link></li>
            <li><Link href="/listings?propertyType=CONDO" className="hover:text-ink-900">Condos</Link></li>
            <li><Link href="/listings?sort=price_asc" className="hover:text-ink-900">Most affordable</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="field-label">For agents</h4>
          <ul className="mt-3 space-y-2 text-sm text-ink-600">
            <li><Link href="/register" className="hover:text-ink-900">List your first property</Link></li>
            <li><Link href="/dashboard/agent" className="hover:text-ink-900">Agent dashboard</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="field-label">Devloria internship</h4>
          <p className="mt-3 text-sm leading-relaxed text-ink-500">
            Built as an original project for the Devloria Web Development Internship — Full
            Stack track. Zillow was referenced for functional flow only; all branding and design
            are original.
          </p>
        </div>
      </div>
      <div className="hairline">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-5 text-xs text-ink-400 md:flex-row">
          <span>© {new Date().getFullYear()} Porchlight.</span>
          <span className="flex items-center gap-1.5">
            <span className="beacon" /> Every light is a home worth finding.
          </span>
        </div>
      </div>
    </footer>
  );
}
