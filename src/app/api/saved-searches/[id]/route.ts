import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { deleteSavedSearch } from "@/lib/queries";

export const runtime = "nodejs";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireSession().catch(() => null);
  if (!session) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  await deleteSavedSearch(id, session.sub);
  return NextResponse.json({ ok: true });
}
