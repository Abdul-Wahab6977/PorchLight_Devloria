import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { createProperty, searchProperties } from "@/lib/queries";
import type { SearchCriteria } from "@/lib/types";

export const runtime = "nodejs";

function parseCriteria(params: URLSearchParams): SearchCriteria {
  const num = (key: string) => {
    const v = params.get(key);
    if (v === null || v === "") return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  };
  return {
    q: params.get("q") ?? undefined,
    city: params.get("city") ?? undefined,
    state: params.get("state") ?? undefined,
    minPrice: num("minPrice"),
    maxPrice: num("maxPrice"),
    propertyType: (params.get("propertyType") as SearchCriteria["propertyType"]) ?? undefined,
    minBeds: num("minBeds"),
    minBaths: num("minBaths"),
    status: (params.get("status") as SearchCriteria["status"]) ?? undefined,
    sort: (params.get("sort") as SearchCriteria["sort"]) ?? undefined,
    page: num("page") ?? 1,
    pageSize: num("pageSize") ?? 12,
  };
}

export async function GET(req: NextRequest) {
  const session = await getSession();
  const criteria = parseCriteria(req.nextUrl.searchParams);
  const { results, total } = await searchProperties(criteria, session?.sub ?? null);
  return NextResponse.json({
    results,
    total,
    page: criteria.page ?? 1,
    pageSize: criteria.pageSize ?? 12,
    totalPages: Math.max(1, Math.ceil(total / (criteria.pageSize ?? 12))),
  });
}

const createSchema = z.object({
  title: z.string().min(4),
  description: z.string().min(10),
  price: z.number().positive(),
  propertyType: z.enum(["SINGLE_FAMILY", "APARTMENT", "CONDO", "TOWNHOUSE", "LAND"]),
  status: z.enum(["FOR_SALE", "PENDING", "SOLD"]).default("FOR_SALE"),
  bedrooms: z.number().int().min(0),
  bathrooms: z.number().min(0),
  sqft: z.number().int().min(0),
  lotSize: z.number().int().nullable().optional(),
  yearBuilt: z.number().int().nullable().optional(),
  address: z.string().min(3),
  city: z.string().min(1),
  state: z.string().min(2).max(2),
  zip: z.string().min(3),
  lat: z.number().nullable().optional(),
  lng: z.number().nullable().optional(),
  images: z.array(z.string()).default([]),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || (session.role !== "AGENT" && session.role !== "ADMIN")) {
    return NextResponse.json({ error: "Only agents can create listings" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid listing data" },
      { status: 400 }
    );
  }

  const id = await createProperty({ agentId: session.sub, ...parsed.data });
  return NextResponse.json({ id }, { status: 201 });
}
