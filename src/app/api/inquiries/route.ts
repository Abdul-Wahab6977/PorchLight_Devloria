import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { createInquiry, getPropertyById } from "@/lib/queries";
import { notifyAgentOfInquiry } from "@/lib/email";

export const runtime = "nodejs";

const schema = z.object({
  propertyId: z.string().min(1),
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  message: z.string().min(5),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Please complete the form" },
      { status: 400 }
    );
  }

  const property = await getPropertyById(parsed.data.propertyId);
  if (!property) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

  await createInquiry({
    propertyId: property.id,
    agentId: property.agent_id,
    buyerId: session?.sub ?? null,
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone,
    message: parsed.data.message,
  });

  await notifyAgentOfInquiry({
    agentEmail: property.agent_email,
    agentName: property.agent_name,
    propertyTitle: property.title,
    buyerName: parsed.data.name,
    buyerEmail: parsed.data.email,
    buyerPhone: parsed.data.phone,
    message: parsed.data.message,
    propertyUrl: `/listings/${property.id}`,
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
