import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/auth";
import { countMatchesForCriteria, createSavedSearch, getSavedSearches } from "@/lib/queries";

export const runtime = "nodejs";

export async function GET() {
  const session = await requireSession().catch(() => null);
  if (!session) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const searches = await getSavedSearches(session.sub);
  const withCounts = await Promise.all(
    searches.map(async (s) => ({
      ...s,
      criteria: JSON.parse(s.criteria_json),
      matchCount: await countMatchesForCriteria(JSON.parse(s.criteria_json)),
    }))
  );
  return NextResponse.json({ searches: withCounts });
}

const schema = z.object({
  name: z.string().min(1),
  criteria: z.record(z.string(), z.any()),
});

export async function POST(req: NextRequest) {
  const session = await requireSession().catch(() => null);
  if (!session) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid saved search" }, { status: 400 });

  const id = await createSavedSearch(session.sub, parsed.data.name, parsed.data.criteria);
  return NextResponse.json({ id }, { status: 201 });
}
