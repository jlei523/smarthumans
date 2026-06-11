import { NextRequest, NextResponse } from "next/server";
import { searchAll } from "@/lib/queries";

export const dynamic = "force-dynamic";

/** Lightweight payload behind the header search's autocomplete. */
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json({ people: [], claims: [] });
  const { people, propositions } = await searchAll(q);
  return NextResponse.json({
    people: people.slice(0, 4).map((p) => ({
      slug: p.slug,
      name: p.name,
      domain: p.domain,
      imageUrl: p.imageUrl,
      isAgent: p.isAgent,
    })),
    claims: propositions.slice(0, 5).map((p) => ({
      slug: p.slug,
      title: p.question || p.statement,
      status: p.status,
    })),
  });
}
