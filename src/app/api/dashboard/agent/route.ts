import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import {
  getAgentStats,
  getInquiriesForAgent,
  getInquiryCountsByProperty,
  getPropertiesByAgent,
} from "@/lib/queries";

export const runtime = "nodejs";

export async function GET() {
  const session = await requireSession().catch(() => null);
  if (!session || (session.role !== "AGENT" && session.role !== "ADMIN")) {
    return NextResponse.json({ error: "Agent access required" }, { status: 403 });
  }

  const [properties, inquiries, stats, inquiryCounts] = await Promise.all([
    getPropertiesByAgent(session.sub),
    getInquiriesForAgent(session.sub),
    getAgentStats(session.sub),
    getInquiryCountsByProperty(session.sub),
  ]);

  return NextResponse.json({ properties, inquiries, stats, inquiryCounts });
}
