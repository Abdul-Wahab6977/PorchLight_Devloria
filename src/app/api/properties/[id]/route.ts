import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { deleteProperty, getPropertyById, updateProperty } from "@/lib/queries";

export const runtime = "nodejs";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  const property = await getPropertyById(id, session?.sub ?? null);
  if (!property) return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  return NextResponse.json({ property });
}

const updateSchema = z.object({
  title: z.string().min(4).optional(),
  description: z.string().min(10).optional(),
  price: z.number().positive().optional(),
  propertyType: z.enum(["SINGLE_FAMILY", "APARTMENT", "CONDO", "TOWNHOUSE", "LAND"]).optional(),
  status: z.enum(["FOR_SALE", "PENDING", "SOLD"]).optional(),
  bedrooms: z.number().int().min(0).optional(),
  bathrooms: z.number().min(0).optional(),
  sqft: z.number().int().min(0).optional(),
  lotSize: z.number().int().nullable().optional(),
  yearBuilt: z.number().int().nullable().optional(),
  address: z.string().min(3).optional(),
  city: z.string().min(1).optional(),
  state: z.string().min(2).max(2).optional(),
  zip: z.string().min(3).optional(),
  lat: z.number().nullable().optional(),
  lng: z.number().nullable().optional(),
  images: z.array(z.string()).optional(),
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const existing = await getPropertyById(id);
  if (!existing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  if (existing.agent_id !== session.sub && session.role !== "ADMIN") {
    return NextResponse.json({ error: "You can only edit your own listings" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid listing data" },
      { status: 400 }
    );
  }

  await updateProperty(id, parsed.data);
  const updated = await getPropertyById(id);
  return NextResponse.json({ property: updated });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const existing = await getPropertyById(id);
  if (!existing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  if (existing.agent_id !== session.sub && session.role !== "ADMIN") {
    return NextResponse.json({ error: "You can only delete your own listings" }, { status: 403 });
  }

  await deleteProperty(id);
  return NextResponse.json({ ok: true });
}
