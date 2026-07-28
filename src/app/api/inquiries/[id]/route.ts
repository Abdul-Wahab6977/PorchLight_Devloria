import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/auth";
import { markInquiryStatus } from "@/lib/queries";

export const runtime = "nodejs";

const schema = z.object({ status: z.enum(["NEW", "READ", "RESPONDED"]) });

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireSession().catch(() => null);
  if (!session) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid status" }, { status: 400 });

  await markInquiryStatus(id, session.sub, parsed.data.status);
  return NextResponse.json({ ok: true });
}
