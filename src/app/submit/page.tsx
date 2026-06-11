import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { SubmitWizard } from "./submit-wizard";
import { db } from "@/db";
import { comments, propositions, type Category } from "@/db/schema";

export const metadata: Metadata = {
  title: "Submit a claim",
  description:
    "Add a prediction or promise to the public record. No primary source, no claim.",
};

export const dynamic = "force-dynamic";

export default async function SubmitPage({
  searchParams,
}: {
  searchParams: Promise<{ stake?: string }>;
}) {
  const { stake } = await searchParams;
  const [allProps, people] = await Promise.all([
    db.query.propositions.findMany({
      columns: { id: true, slug: true, statement: true },
    }),
    db.query.people.findMany({
      columns: { name: true, slug: true, imageUrl: true, domain: true },
    }),
  ]);

  // "Stake it": a discussion assertion becomes the seed of a proposition.
  // The comment permalink is the primary source.
  let staked: {
    commentId: number;
    quote: string;
    author: string;
    sourceUrl: string;
    category: Category;
  } | null = null;
  const stakeId = Number(stake);
  if (Number.isFinite(stakeId)) {
    const comment = await db.query.comments.findFirst({
      where: eq(comments.id, stakeId),
      with: { user: { columns: { name: true } } },
    });
    if (comment) {
      const prop = await db.query.propositions.findFirst({
        where: eq(propositions.id, comment.propositionId),
        columns: { category: true },
      });
      staked = {
        commentId: comment.id,
        quote: comment.body,
        author: comment.user.name,
        sourceUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/comments/${comment.id}`,
        category: (prop?.category ?? "other") as Category,
      };
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-serif text-3xl font-bold tracking-tight">
        Submit a claim
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Add a prediction or promise to the public record. Every submission goes
        through community review before publication.
      </p>
      <div className="mt-5 rounded-md border bg-card p-3 text-sm">
        <p className="font-semibold">No primary source, no claim.</p>
        <p className="mt-0.5 text-muted-foreground">
          Every quote must link to video, an archived post, an official
          filing, or a published article.
        </p>
      </div>
      {staked && (
        <div className="mt-5 rounded-md border bg-st-pending-bg p-3 text-sm">
          <p className="font-semibold">
            Staking u/{staked.author}&apos;s assertion from a discussion.
          </p>
          <p className="mt-0.5 text-muted-foreground">
            The comment permalink is attached as the primary source. Rephrase
            the assertion as a falsifiable proposition with a deadline and
            criteria.
          </p>
        </div>
      )}
      <SubmitWizard
        existing={allProps}
        people={people}
        initialDraft={
          staked
            ? {
                quote: staked.quote,
                speaker: `u/${staked.author}`,
                sourceUrl: staked.sourceUrl,
                category: staked.category,
                venue: "SmartHumans discussion",
                dateStated: new Date().toISOString().slice(0, 10),
              }
            : undefined
        }
        sourceCommentId={staked?.commentId}
      />
    </div>
  );
}
