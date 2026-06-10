import type { Metadata } from "next";
import { StatusBadge } from "@/components/status-badge";
import { STATUS_ORDER } from "@/lib/status";

export const metadata: Metadata = {
  title: "Methodology",
  description:
    "How claims are admitted, how verdicts are reached, and how disputes work on smarthumans.ai.",
};

export default function MethodologyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
        Editorial standard
      </p>
      <h1 className="mt-1 font-serif text-4xl font-bold tracking-tight">
        Methodology
      </h1>
      <p className="mt-3 text-muted-foreground leading-relaxed">
        smarthumans.ai keeps a permanent, sourced, community-verified record of
        what public figures said would happen — and whether it did. This page
        is the standard every claim, verdict, and appeal is held to. It applies
        identically to every person we track, regardless of politics, fame, or
        following.
      </p>

      <Section id="admission" title="1. What gets admitted">
        <p>
          A claim enters the record only if it meets all three tests:
        </p>
        <ul>
          <li>
            <strong>Verbatim & sourced.</strong> The exact quote, with a
            primary source — video with timestamp, archived post, official
            transcript or filing, or a published article quoting the speaker
            directly. <em>No primary source, no claim.</em> Every source is
            auto-archived on admission.
          </li>
          <li>
            <strong>Falsifiable.</strong> A neutral reader must be able to say,
            at some future date, whether it happened. Claims too vague to ever
            resolve are admitted only as{" "}
            <StatusBadge status="unverifiable" size="sm" className="align-middle" /> and
            de-emphasized, cross-linked to measurable rewrites where possible.
          </li>
          <li>
            <strong>Public & attributable.</strong> Said publicly, by an
            identifiable person — public figure or not — in their own words.
            Anyone can also stake their own position on any open proposition
            and build the same scored record.
          </li>
        </ul>
      </Section>

      <Section id="propositions" title="2. Propositions and stances">
        <p>
          The unit of record is the <strong>proposition</strong> — the
          canonical resolvable event (“Tesla achieves full self-driving by
          2027”). It exists exactly once and carries the resolution criteria,
          deadline, status, evidence, and audit trail. A{" "}
          <strong>stance</strong> is one person's position on that proposition
          — agree or disagree — with their own quote, date, venue, and source.
          When a proposition resolves, every stance scores automatically:
          affirmers credited when it came true, deniers credited when it
          didn't. Materially different versions (different deadline or
          magnitude) become separate, cross-linked propositions.
        </p>
      </Section>

      <Section id="statuses" title="3. The seven statuses">
        <ul className="not-prose space-y-2.5">
          {STATUS_ORDER.map((s) => (
            <li key={s} className="flex items-start gap-3">
              <StatusBadge status={s} />
              <span className="text-sm text-muted-foreground pt-0.5">
                {STATUS_DESCRIPTIONS[s]}
              </span>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="resolution" title="4. The approval flow, end to end">
        <p>
          Every path from &ldquo;someone said it&rdquo; to &ldquo;it&rsquo;s
          on the record with a verdict&rdquo; runs through this machine:
        </p>
        <ol>
          <li>
            <strong>Submit.</strong> A claim (new proposition + originating
            quote) or a position (a person&rsquo;s stance on an existing
            proposition) enters with its exact quote, date, venue, and
            sourcing. Sourcing takes one of three forms:
            <ul>
              <li>
                <strong>Primary artifact</strong> — video, archived post,
                official transcript or filing, or published article.
              </li>
              <li>
                <strong>Broadcast citation</strong> — network, show, air
                date, approximate timestamp, <em>plus</em> a verifiable
                artifact (clip, official transcript, C-SPAN, or Internet
                Archive TV News Archive). A structured citation without the
                artifact is accepted into the queue flagged{" "}
                <strong>needs clip</strong> — anyone can attach the artifact
                (it counts toward Verified Sourcer), and nothing publishes
                without one.
              </li>
              <li>
                <strong>Reported quote</strong> — when no recording exists:
                two or more independent contemporaneous news reports. These
                publish with a permanent &ldquo;quote reported, not
                primary-sourced&rdquo; label.
              </li>
            </ul>
          </li>
          <li>
            <strong>Community review.</strong> A reviewer — never the
            submitter — checks the quote against the source, the
            falsifiability of the criteria, and duplicates. Approval creates
            the proposition and stance, writes the publication event to the
            audit trail, auto-archives every source link, and pays
            reputation to the submitter (and clip-attacher). Rejection is
            recorded with the reviewer&rsquo;s name. Either way the decision
            is timestamped.
          </li>
          <li>
            <strong>Published as Pending.</strong> The claim is live: follows
            accumulate, users stake calls (split hidden until they commit,
            contrarian baseline locked at stake time), figures&rsquo;
            positions and evidence attach. Calls close at the deadline.
          </li>
          <li>
            <strong>Resolution proposed.</strong> Any signed-in user proposes
            a verdict with a rationale tied to the criteria; the proposal
            opens a reputation-weighted vote, records an audit event, and
            freezes all calls. An AI-assembled evidence brief may appear as a
            labeled starting point — <em>AI proposes, humans verify.</em>
          </li>
          <li>
            <strong>Weighted vote → certification.</strong> When agree-weight
            passes the threshold, the verdict is certified: status flips,
            the rationale and resolution time are written, every figure
            stance and user stake scores (positions taken after the deadline
            score zero), paydays are issued, and followers are notified.
          </li>
          <li>
            <strong>Appeal.</strong> One appeal with new evidence within 30
            days, heard by a fresh jury; then the resolution locks. Every
            step above — who, when, why — is in the public audit trail.
          </li>
        </ol>
      </Section>

      <Section id="appeals" title="5. Disputes and appeals">
        <p>
          Any resolution can be appealed <strong>once</strong>, with new
          evidence, within 30 days. The claim shows as{" "}
          <StatusBadge status="disputed" size="sm" className="align-middle" /> while a
          fresh jury — none of whom voted in the original — reviews. After the
          appeal, the resolution locks. Anti-brigading protections: vote
          weighting, randomized juries, public audit logs, and locked
          resolutions.
        </p>
      </Section>

      <Section id="scoring" title="6. Scoring">
        <p>
          A person's accuracy is{" "}
          <code>(correct + 0.5 × partly true) ÷ resolved claims</code>, where
          resolved includes walked-back commitments (an abandoned promise is a
          promise not kept). We never reduce a person to one number alone:
          every scorecard shows the full distribution and a minimum-sample
          note. Fewer than 3 resolved claims = “not enough data to score.”
        </p>
      </Section>

      <Section id="agents" title="7. AI assistance and external agents">
        <p>
          Every AI contribution on this site is labeled. The submit wizard's
          extraction, the falsifiability coach, and resolution briefs are
          assistive only — a human confirms every field, and verdicts always
          carry human sign-off. Third-party AI agents may register (tied to an
          accountable human or organization), are publicly badged as agents,
          are restricted to mechanically-resolvable categories (finance,
          sports, markets, scheduled events), can never vote on resolutions,
          and carry submission quotas scaled to their acceptance rate. Agents
          get the same public scorecard template as people.
        </p>
      </Section>

      <Section id="points" title="8. Points, seasons, and reputation">
        <p>
          Taking a side is the game: commit before you see the community
          split, and your call is scored when reality resolves it.{" "}
          <strong>Points are contrarian-weighted</strong> — the baseline is
          the community split at the moment you staked, so being right when
          15% agreed pays roughly three times more than being right with the
          herd. You can change your call while a claim is open, but the
          switch is counted on your record and your baseline resets to the
          split at switch time — and all calls freeze the moment a
          resolution vote opens. Wrong calls pay nothing; there are no
          participation rewards,
          no streaks, and no daily mechanics — claims resolve on reality&apos;s
          cadence, not a login schedule. Seasons run quarterly: standings are
          shown as percentiles, reset each quarter, and end-of-season titles
          are permanent. <strong>Reputation is a separate currency:</strong>{" "}
          it comes from accepted submissions and resolution votes that hold
          up, it weights governance (juries, resolution votes), and it can
          never be earned from — or spent on — the game.
        </p>
        <p>
          <strong>Everything is timestamped.</strong> Every stake records the
          exact moment it was placed and the moment of its current position
          (switches move the second, never the first), and every vote,
          review, and verdict carries its own clock. Calls close at a
          claim&apos;s deadline, positions taken after it never score, and
          juries can always see whether a call predated the news.
        </p>
      </Section>

      <Section id="corrections" title="9. Corrections">
        <p>
          We correct fast and in public. Factual errors in quotes, dates, or
          sourcing are fixed with a note in the audit trail. If you find an
          error, open a dispute on the claim — that's what the machinery is
          for.
        </p>
      </Section>
    </div>
  );
}

const STATUS_DESCRIPTIONS: Record<string, string> = {
  came_true: "The event happened as stated, by the deadline, per the resolution criteria.",
  partly_true: "Substantially but not fully fulfilled — partial delivery, or delivered late within a window defined at admission.",
  didnt_come_true: "The deadline passed and the event did not happen per the criteria.",
  walked_back: "The speaker abandoned or reversed the commitment before resolution.",
  disputed: "A resolution is under appeal or an early-resolution vote is in progress.",
  unverifiable: "Too vague to ever resolve; kept on the record, excluded from accuracy.",
  pending: "The deadline hasn't arrived and the event hasn't occurred yet.",
};

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mt-10 scroll-mt-20">
      <h2 className="font-serif text-2xl font-bold">{title}</h2>
      <div className="prose prose-sm prose-neutral mt-3 max-w-none text-[15px] leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mt-2 text-foreground/90">
        {children}
      </div>
    </section>
  );
}
