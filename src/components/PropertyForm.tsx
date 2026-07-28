"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import type { PropertyWithExtras } from "@/lib/types";

interface FormState {
  title: string;
  description: string;
  price: string;
  propertyType: string;
  status: string;
  bedrooms: string;
  bathrooms: string;
  sqft: string;
  lotSize: string;
  yearBuilt: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  images: string[];
}

const EMPTY: FormState = {
  title: "",
  description: "",
  price: "",
  propertyType: "SINGLE_FAMILY",
  status: "FOR_SALE",
  bedrooms: "3",
  bathrooms: "2",
  sqft: "",
  lotSize: "",
  yearBuilt: "",
  address: "",
  city: "",
  state: "",
  zip: "",
  images: [],
};

export function PropertyForm({ initial, propertyId }: { initial?: PropertyWithExtras; propertyId?: string }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(
    initial
      ? {
          title: initial.title,
          description: initial.description,
          price: String(initial.price),
          propertyType: initial.property_type,
          status: initial.status,
          bedrooms: String(initial.bedrooms),
          bathrooms: String(initial.bathrooms),
          sqft: String(initial.sqft),
          lotSize: initial.lot_size ? String(initial.lot_size) : "",
          yearBuilt: initial.year_built ? String(initial.year_built) : "",
          address: initial.address,
          city: initial.city,
          state: initial.state,
          zip: initial.zip,
          images: initial.images.map((i) => i.url),
        }
      : EMPTY
  );
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function addImage() {
    if (!imageUrl.trim()) return;
    set("images", [...form.images, imageUrl.trim()]);
    setImageUrl("");
  }

  function removeImage(i: number) {
    set("images", form.images.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const payload = {
      title: form.title,
      description: form.description,
      price: Number(form.price),
      propertyType: form.propertyType,
      status: form.status,
      bedrooms: Number(form.bedrooms),
      bathrooms: Number(form.bathrooms),
      sqft: Number(form.sqft),
      lotSize: form.lotSize ? Number(form.lotSize) : null,
      yearBuilt: form.yearBuilt ? Number(form.yearBuilt) : null,
      address: form.address,
      city: form.city,
      state: form.state.toUpperCase(),
      zip: form.zip,
      images: form.images,
    };

    try {
      const res = await fetch(propertyId ? `/api/properties/${propertyId}` : "/api/properties", {
        method: propertyId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not save listing");
        return;
      }
      router.push("/dashboard/agent");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <section className="card space-y-4 p-6">
        <h2 className="font-display text-lg text-ink-900">Basics</h2>
        <div>
          <label className="field-label">Title</label>
          <input required className="field-input" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Sunlit craftsman near the arboretum" />
        </div>
        <div>
          <label className="field-label">Description</label>
          <textarea required rows={5} className="field-input resize-none" value={form.description} onChange={(e) => set("description", e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div>
            <label className="field-label">Price (USD)</label>
            <input required type="number" min={0} className="field-input" value={form.price} onChange={(e) => set("price", e.target.value)} />
          </div>
          <div>
            <label className="field-label">Property type</label>
            <select className="field-input" value={form.propertyType} onChange={(e) => set("propertyType", e.target.value)}>
              <option value="SINGLE_FAMILY">Single-family</option>
              <option value="APARTMENT">Apartment</option>
              <option value="CONDO">Condo</option>
              <option value="TOWNHOUSE">Townhouse</option>
              <option value="LAND">Land</option>
            </select>
          </div>
          <div>
            <label className="field-label">Status</label>
            <select className="field-input" value={form.status} onChange={(e) => set("status", e.target.value)}>
              <option value="FOR_SALE">For sale</option>
              <option value="PENDING">Pending</option>
              <option value="SOLD">Sold</option>
            </select>
          </div>
        </div>
      </section>

      <section className="card space-y-4 p-6">
        <h2 className="font-display text-lg text-ink-900">Details</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <label className="field-label">Bedrooms</label>
            <input required type="number" min={0} className="field-input" value={form.bedrooms} onChange={(e) => set("bedrooms", e.target.value)} />
          </div>
          <div>
            <label className="field-label">Bathrooms</label>
            <input required type="number" min={0} step={0.5} className="field-input" value={form.bathrooms} onChange={(e) => set("bathrooms", e.target.value)} />
          </div>
          <div>
            <label className="field-label">Living sqft</label>
            <input required type="number" min={0} className="field-input" value={form.sqft} onChange={(e) => set("sqft", e.target.value)} />
          </div>
          <div>
            <label className="field-label">Lot size (sqft)</label>
            <input type="number" min={0} className="field-input" value={form.lotSize} onChange={(e) => set("lotSize", e.target.value)} />
          </div>
        </div>
        <div>
          <label className="field-label">Year built</label>
          <input type="number" className="field-input max-w-[160px]" value={form.yearBuilt} onChange={(e) => set("yearBuilt", e.target.value)} />
        </div>
      </section>

      <section className="card space-y-4 p-6">
        <h2 className="font-display text-lg text-ink-900">Location</h2>
        <div>
          <label className="field-label">Street address</label>
          <input required className="field-input" value={form.address} onChange={(e) => set("address", e.target.value)} />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="field-label">City</label>
            <input required className="field-input" value={form.city} onChange={(e) => set("city", e.target.value)} />
          </div>
          <div>
            <label className="field-label">State</label>
            <input required maxLength={2} className="field-input uppercase" value={form.state} onChange={(e) => set("state", e.target.value)} placeholder="CA" />
          </div>
          <div>
            <label className="field-label">ZIP</label>
            <input required className="field-input" value={form.zip} onChange={(e) => set("zip", e.target.value)} />
          </div>
        </div>
      </section>

      <section className="card space-y-4 p-6">
        <h2 className="font-display text-lg text-ink-900">Photos</h2>
        <p className="text-sm text-ink-500">Paste image URLs (Unsplash, your own hosting, etc). The first one becomes the cover photo.</p>
        <div className="flex gap-2">
          <input
            className="field-input"
            placeholder="https://images.unsplash.com/..."
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addImage())}
          />
          <button type="button" onClick={addImage} className="btn btn-ghost shrink-0">
            <ImagePlus size={15} /> Add
          </button>
        </div>
        {form.images.length > 0 && (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {form.images.map((url, i) => (
              <div key={i} className="group relative aspect-square overflow-hidden rounded-md bg-ink-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute right-1 top-1 rounded-full bg-ink-900/80 p-1 text-paper-soft opacity-0 transition group-hover:opacity-100"
                >
                  <Trash2 size={13} />
                </button>
                {i === 0 && <span className="absolute bottom-1 left-1 tag border-none bg-paper-soft/90 text-[9px]">Cover</span>}
              </div>
            ))}
          </div>
        )}
      </section>

      {error && <p className="text-sm text-clay-500">{error}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="btn btn-amber">
          {saving ? "Saving…" : propertyId ? "Save changes" : "Publish listing"}
        </button>
        <button type="button" onClick={() => router.back()} className="btn btn-ghost">
          Cancel
        </button>
      </div>
    </form>
  );
}
