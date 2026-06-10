import Link from "next/link";
import type { Metadata } from "next";
import { SearchBar } from "@/components/search-bar";
import { ClaimCard } from "@/components/claim-card";
import { PersonAvatar } from "@/components/person-chip";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import {
  getFollowedPropositionIds,
  getUserStanceMap,
  searchAll,
  primaryStance,
} from "@/lib/queries";
import { DOMAIN_LABEL } from "@/lib/status";

export const metadata: Metadata = { title: "Search" };
export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const session = await auth.api.getSession({ headers: await headers() });
  const [results, followedIds, stanceMap] = await Promise.all([
    q.trim() ? searchAll(q.trim()) : Promise.resolve(null),
    getFollowedPropositionIds(session?.user?.id),
    getUserStanceMap(session?.user?.id),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-serif text-3xl font-bold tracking-tight">Search</h1>
      <SearchBar size="lg" className="mt-4 max-w-xl" />

      {results && (
        <>
          {results.people.length > 0 && (
            <section className="mt-8">
              <h2 className="text-sm font-semibold text-muted-foreground">People</h2>
              <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {results.people.map((p) => (
                  <Link
                    key={p.id}
                    href={`/p/${p.slug}`}
                    className="flex items-center gap-3 rounded-lg border bg-card p-3 hover:shadow-md transition-shadow"
                  >
                    <PersonAvatar person={p} size="lg" />
                    <span>
                      <span className="block font-medium">{p.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {DOMAIN_LABEL[p.domain]}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section className="mt-8">
            <h2 className="text-sm font-semibold text-muted-foreground">
              Claims ({results.propositions.length})
            </h2>
            <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {results.propositions.map((p) => (
                <ClaimCard
                  key={p.id}
                  proposition={p}
                  stance={primaryStance(p)}
                  following={followedIds.has(p.id)}
                  myStance={stanceMap[p.id] ?? null}
                />
              ))}
            </div>
          </section>

          {results.people.length === 0 && results.propositions.length === 0 && (
            <div className="mt-10 rounded-lg border border-dashed p-10 text-center">
              <p className="font-serif text-lg font-semibold">
                No results for “{q}”
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                We may not track this person yet.
              </p>
              <Link
                href="/submit"
                className="mt-4 inline-block rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background"
              >
                Request this person — submit their first claim
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
