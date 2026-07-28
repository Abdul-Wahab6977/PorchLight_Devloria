import { notFound } from "next/navigation";
import { Bath, Bed, Calendar, MapPin, Ruler, Trees } from "lucide-react";
import { getPropertyById } from "@/lib/queries";
import { formatFullPrice, formatRelativeDate, formatSqft, PROPERTY_TYPE_LABELS, STATUS_LABELS } from "@/lib/format";
import { InquiryForm } from "@/components/InquiryForm";
import { FavoriteButton } from "@/components/FavoriteButton";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

const STATUS_STYLE: Record<string, string> = {
  FOR_SALE: "text-moss-500 border-moss-500",
  PENDING: "text-amber-600 border-amber-500",
  SOLD: "text-clay-500 border-clay-500",
};

export default async function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  const property = await getPropertyById(id, session?.sub ?? null);
  if (!property) notFound();

  const gallery = property.images.length ? property.images : [];

  return (
    <div className="container-page py-10">
      <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className={`tag ${STATUS_STYLE[property.status]}`}>{STATUS_LABELS[property.status]}</span>
              <h1 className="mt-3 font-display text-3xl text-ink-900 md:text-4xl">{property.title}</h1>
              <p className="mt-2 flex items-center gap-1.5 text-ink-500">
                <MapPin size={15} /> {property.address}, {property.city}, {property.state} {property.zip}
              </p>
            </div>
            <FavoriteButton propertyId={property.id} initialFavorited={!!property.is_favorited} />
          </div>

          <div className="mt-6 grid gap-2 overflow-hidden rounded-lg">
            {gallery.length > 0 ? (
              <>
                <div className="aspect-[16/9] w-full overflow-hidden rounded-lg bg-ink-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={gallery[0].url} alt={property.title} className="h-full w-full object-cover" />
                </div>
                {gallery.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {gallery.slice(1, 5).map((img) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={img.id} src={img.url} alt="" className="aspect-square w-full rounded-md object-cover" />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="flex aspect-[16/9] items-center justify-center rounded-lg bg-ink-100 text-ink-300">
                No photos yet
              </div>
            )}
          </div>

          <div className="card mt-8 grid grid-cols-2 gap-6 p-6 sm:grid-cols-4">
            <Stat icon={<Bed size={17} />} label="Bedrooms" value={String(property.bedrooms)} />
            <Stat icon={<Bath size={17} />} label="Bathrooms" value={String(property.bathrooms)} />
            <Stat icon={<Ruler size={17} />} label="Living area" value={formatSqft(property.sqft)} />
            <Stat icon={<Trees size={17} />} label="Lot size" value={property.lot_size ? `${property.lot_size.toLocaleString()} sqft` : "—"} />
          </div>

          <div className="mt-8">
            <h2 className="font-display text-xl text-ink-900">About this home</h2>
            <p className="mt-3 whitespace-pre-line leading-relaxed text-ink-600">{property.description}</p>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 border-t border-paper-line pt-6 text-sm sm:grid-cols-4">
            <Detail label="Type" value={PROPERTY_TYPE_LABELS[property.property_type]} />
            <Detail label="Year built" value={property.year_built ? String(property.year_built) : "—"} />
            <Detail label="Status" value={STATUS_LABELS[property.status]} />
            <Detail label="Listed" value={formatRelativeDate(property.created_at)} />
          </div>
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="card p-6">
            <span className="font-mono text-2xl text-ink-900">{formatFullPrice(property.price)}</span>
            <p className="mt-1 text-sm text-ink-500">
              ≈ {formatFullPrice(Math.round(property.price / property.sqft))} / sqft
            </p>

            <div className="mt-5 flex items-center gap-3 border-t border-paper-line pt-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-800 font-display text-sm text-paper-soft">
                {property.agent_name.slice(0, 1)}
              </div>
              <div>
                <p className="text-sm font-medium text-ink-800">{property.agent_name}</p>
                <p className="text-xs text-ink-400">Listing agent</p>
              </div>
            </div>
          </div>

          <div className="card mt-4 p-6">
            <h3 className="flex items-center gap-2 font-display text-lg text-ink-900">
              <Calendar size={16} /> Ask about this home
            </h3>
            <p className="mt-1 text-sm text-ink-500">
              Your message goes straight to {property.agent_name.split(" ")[0]}.
            </p>
            <div className="mt-4">
              <InquiryForm propertyId={property.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <div className="flex items-center gap-2 text-ink-400">
        {icon}
        <span className="text-xs uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-1 font-display text-lg text-ink-900">{value}</p>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="field-label">{label}</p>
      <p className="text-ink-700">{value}</p>
    </div>
  );
}
