import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeftRight } from "lucide-react";
import { PersonAvatar } from "@/components/person-chip";
import { ScoreGauge, DistributionBar, SubtypeSplit } from "@/components/charts";
import { getAllPeople, getPersonScore, type PersonScore } from "@/lib/queries";
import { CATEGORY_LABEL, DOMAIN_LABEL } from "@/lib/status";
import { pct } from "@/lib/format";
import type { Category } from "@/db/schema";

export const metadata: Metadata = { title: "Compare track records" };
export const dynamic = "force-dynamic";

// Canonical display order — matches the schema enum order
const CATEGORY_ORDER: Category[] = [
  "ai",
  "markets",
  "stocks",
  "semiconductors",
  "gold",
  "economy",
  "health",
  "immigration",
  "foreign_policy",
  "nba",
  "mlb",
  "nfl",
  "f1",
  "other",
];

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ a?: string; b?: string }>;
}) {
  const { a, b } = await searchParams;
  const all = await getAllPeople();
  const slugA = a ?? all[0]?.slug;
  const slugB = b ?? all[1]?.slug;
  const [scoreA, scoreB] = await Promise.all([
    slugA ? getPersonScore(slugA) : null,
    slugB ? getPersonScore(slugB) : null,
  ]);

  // Build a union category list in canonical order so both cards' rows align
  const catSetA = new Set(scoreA?.categoryBreakdown.map((c) => c.category) ?? []);
  const catSetB = new Set(scoreB?.categoryBreakdown.map((c) => c.category) ?? []);
  const allCategories = CATEGORY_ORDER.filter((k) => catSetA.has(k) || catSetB.has(k));

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="flex items-center gap-2 font-serif text-3xl font-bold tracking-tight">
        <ArrowLeftRight className="size-7" /> Compare
      </h1>

      <form className="mt-5 flex flex-wrap items-center gap-2" action="/compare">
        <PersonSelect name="a" people={all} value={slugA} />
        <span className="text-sm text-muted-foreground">vs</span>
        <PersonSelect name="b" people={all} value={slugB} />
        <button className="rounded-md bg-foreground px-3 py-1.5 text-sm font-medium text-background">
          Compare
        </button>
      </form>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {[scoreA, scoreB].map((s, i) =>
          s ? (
            <CompareCard key={s.person.id} score={s} allCategories={allCategories} />
          ) : (
            <div key={i} className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
              Pick a person to compare.
            </div>
          ),
        )}
      </div>
    </div>
  );
}

function PersonSelect({
  name,
  people,
  value,
}: {
  name: string;
  people: Array<{ slug: string; name: string }>;
  value?: string;
}) {
  return (
    <select
      name={name}
      defaultValue={value}
      className="rounded-md border bg-background px-3 py-1.5 text-sm"
    >
      {people.map((p) => (
        <option key={p.slug} value={p.slug}>
          {p.name}
        </option>
      ))}
    </select>
  );
}

function CompareCard({
  score,
  allCategories,
}: {
  score: PersonScore;
  allCategories: Category[];
}) {
  const { person, scorecard, subtypeBreakdown, categoryBreakdown } = score;
  const catMap = new Map(categoryBreakdown.map((c) => [c.category, c.scorecard]));

  return (
    <div className="rounded-lg border bg-card p-5">
      <Link href={`/p/${person.slug}`} className="flex items-center gap-3 group">
        <PersonAvatar person={person} size="lg" />
        <div>
          <p className="font-serif text-lg font-bold group-hover:underline underline-offset-2">
            {person.name}
          </p>
          <p className="text-xs text-muted-foreground">{DOMAIN_LABEL[person.domain]}</p>
        </div>
      </Link>
      <div className="mt-4 flex justify-center">
        {scorecard.hasEnoughData ? (
          <ScoreGauge accuracy={scorecard.accuracy} resolved={scorecard.resolved} />
        ) : (
          <p className="py-6 text-sm text-muted-foreground">
            Not enough data to score.
          </p>
        )}
      </div>
      <DistributionBar scorecard={scorecard} className="mt-3" />
      <SubtypeSplit breakdown={subtypeBreakdown} className="mt-3" />
      {allCategories.length > 0 && (
        <table className="mt-4 w-full text-sm">
          <tbody>
            {allCategories.map((cat) => {
              const sc = catMap.get(cat);
              return (
                <tr key={cat} className="border-b last:border-0">
                  <td className="py-1.5 text-muted-foreground">
                    {CATEGORY_LABEL[cat]}
                  </td>
                  <td className="py-1.5 text-right tabular-nums">
                    {sc == null ? (
                      <span className="text-ink-4">—</span>
                    ) : sc.accuracy === null ? (
                      <span className="font-mono text-muted-foreground">—</span>
                    ) : (
                      <>
                        <span className="font-mono font-medium">{pct(sc.accuracy)}</span>
                        <span className="ml-1 font-mono text-[11px] text-ink-3">n={sc.resolved}</span>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
