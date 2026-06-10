import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { comments, propositions } from "@/db/schema";

/**
 * Canonical comment permalinks — comments are first-class entities. Today
 * a permalink resolves into its claim thread; when the forum arrives the
 * same URL can render a comment as a top-level post without migration.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const commentId = Number(id);
  if (!Number.isFinite(commentId)) redirect("/");
  const comment = await db.query.comments.findFirst({
    where: eq(comments.id, commentId),
    columns: { propositionId: true },
  });
  if (!comment) redirect("/");
  const prop = await db.query.propositions.findFirst({
    where: eq(propositions.id, comment.propositionId),
    columns: { slug: true },
  });
  if (!prop) redirect("/");
  redirect(`/claims/${prop.slug}#comment-${commentId}`);
}
