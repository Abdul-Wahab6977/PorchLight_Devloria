import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/auth";
import { getFavoritesForUser, toggleFavorite } from "@/lib/queries";

export const runtime = "nodejs";

export async function GET() {
  const session = await requireSession().catch(() => null);
  if (!session) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const favorites = await getFavoritesForUser(session.sub);
  return NextResponse.json({ favorites });
}

const schema = z.object({ propertyId: z.string().min(1) });

export async function POST(req: NextRequest) {
  const session = await requireSession().catch(() => null);
  if (!session) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Missing propertyId" }, { status: 400 });

  const favorited = await toggleFavorite(session.sub, parsed.data.propertyId);
  return NextResponse.json({ favorited });
}
