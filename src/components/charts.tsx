import { cn } from "@/lib/utils";
import { STATUS_META } from "@/lib/status";
import { pct } from "@/lib/format";
import type { Scorecard } from "@/lib/scoring";
import { accuracyGrade } from "@/lib/scoring";
import type { ClaimSubtype } from "@/db/schema";

/**
 * The full record as a quiet text line (count + label per status, with a
 * small dot for colorblind-safe pairing). Replaces the old stacked color
 * bar, which read as decoration.
 */
export function DistributionBar({
  scorecard,
  className,
  showLegend = true,
}: {
  scorecard: Scorecard;
  className?: string;
  /** include the "Record:" prefix */
  showLegend?: boolean;
}) {
  const segments = [
    { key: "came_true", count: scorecard.correct, label: "came true" },
    { key: "partly_true", count: scorecard.partly, label: "partly" },
    { key: "didnt_come_true", count: scorecard.incorrect, label: "didn't" },
    { key: "walked_back", count: scorecard.walkedBack, label: "walked back" },
    { key: "disputed", count: scorecard.disputed, label: "disputed" },
    { key: "unverifiable", count: scorecard.unverifiable, label: "unverifiable" },
    { key: "pending", count: scorecard.pending, label: "pending" },
  ] as const;
  const total = segments.reduce((s, x) => s + x.count, 0);
  if (total === 0) {
    return (
      <div className={cn("text-sm text-muted-foreground", className)}>
        No claims tracked yet.
      </div>
    );
  }
  const active = segments.filter((s) => s.count > 0);
  return (
    <p className={cn("flex flex-wrap gap-y-0.5 text-xs leading-relaxed text-muted-foreground", className)}>
      {showLegend && <span className="mr-1 font-medium text-foreground whitespace-nowrap">Record:</span>}
      {active.map((s, i) => (
        <span key={s.key} className="whitespace-nowrap">
          {i > 0 && <span className="mx-1 text-ink-4">·</span>}
          <span
            className={cn(
              "mr-1 inline-block size-2 rounded-full align-baseline",
              STATUS_META[s.key].dot,
            )}
          />
          <span className="font-medium text-foreground tabular-nums">
            {s.count}
          </span>{" "}
          {s.label}
        </span>
      ))}
    </p>
  );
}

const SUBTYPE_VERB: Record<ClaimSubtype, { plural: string; verb: string }> = {
  prediction: { plural: "Predictions", verb: "came true" },
  promise: { plural: "Promises", verb: "kept" },
  factual: { plural: "Factual claims", verb: "accurate" },
};

/**
 * Per-subtype split rows under a headline record — "Predictions: 64% came
 * true · 41 resolved", "Promises: 38% kept · 29 resolved". The headline
 * accuracy is never shown without this split beside it.
 */
export function SubtypeSplit({
  breakdown,
  className,
}: {
  breakdown: Array<{ subtype: ClaimSubtype; scorecard: Scorecard }>;
  className?: string;
}) {
  if (breakdown.length === 0) return null;
  return (
    <dl className={cn("space-y-1", className)}>
      {breakdown.map(({ subtype, scorecard: sc }) => (
        <div
          key={subtype}
          className="flex flex-wrap items-baseline gap-x-1.5 text-[13px]"
        >
          <dt className="font-medium text-foreground">
            {SUBTYPE_VERB[subtype].plural}:
          </dt>
          <dd className="text-muted-foreground">
            {sc.resolved > 0 && sc.accuracy !== null ? (
              <>
                <span className="font-mono font-semibold tabular-nums text-foreground">
                  {pct(sc.accuracy)}
                </span>{" "}
                {SUBTYPE_VERB[subtype].verb} ·{" "}
                <span className="font-mono tabular-nums">{sc.resolved}</span>{" "}
                resolved
              </>
            ) : (
              <>
                none resolved yet ·{" "}
                <span className="font-mono tabular-nums">{sc.total}</span> open
              </>
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** Semicircular accuracy gauge with grade. */
export function ScoreGauge({
  accuracy,
  resolved,
  size = 160,
  className,
}: {
  accuracy: number | null;
  resolved: number;
  size?: number;
  className?: string;
}) {
  const r = 70;
  const circumference = Math.PI * r;
  const value = accuracy ?? 0;
  return (
    <div className={cn("flex flex-col items-center", className)}>
      <svg
        width={size}
        height={size * 0.62}
        viewBox="0 0 180 112"
        className="overflow-visible"
      >
        <path
          d="M 20 100 A 70 70 0 0 1 160 100"
          fill="none"
          stroke="var(--muted)"
          strokeWidth="14"
          strokeLinecap="round"
        />
        {accuracy !== null && (
          <path
            d="M 20 100 A 70 70 0 0 1 160 100"
            fill="none"
            stroke={
              value >= 0.6
                ? "var(--color-st-true)"
                : value >= 0.4
                  ? "var(--color-st-partly)"
                  : "var(--color-st-false)"
            }
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={`${circumference * value} ${circumference}`}
          />
        )}
        <text
          x="90"
          y="86"
          textAnchor="middle"
          className="fill-foreground font-mono text-[34px] font-semibold"
        >
          {accuracy === null ? "—" : pct(accuracy)}
        </text>
        <text
          x="90"
          y="106"
          textAnchor="middle"
          className="fill-muted-foreground text-[11px]"
        >
          {accuracy === null
            ? "not enough data"
            : `accuracy · grade ${accuracyGrade(value)}`}
        </text>
      </svg>
      <p className="text-xs text-muted-foreground -mt-1">
        based on{" "}
        <span className="font-mono font-medium text-foreground">{resolved}</span>{" "}
        resolved claim{resolved === 1 ? "" : "s"}
      </p>
    </div>
  );
}

export function accuracyTextClass(accuracy: number | null): string {
  if (accuracy === null) return "text-ink-3";
  if (accuracy >= 0.6) return "text-st-true-tx";
  if (accuracy >= 0.4) return "text-st-partly-tx";
  return "text-st-false-tx";
}

/** Small accuracy donut for figure cards. */
export function MiniDonut({
  accuracy,
  size = 48,
  className,
}: {
  accuracy: number | null;
  size?: number;
  className?: string;
}) {
  const r = 19;
  const c = 2 * Math.PI * r;
  const stroke =
    accuracy === null
      ? "var(--color-ink-4)"
      : accuracy >= 0.6
        ? "var(--color-st-true)"
        : accuracy >= 0.4
          ? "var(--color-st-partly)"
          : "var(--color-st-false)";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={cn("-rotate-90", className)}
    >
      <circle cx="24" cy="24" r={r} fill="none" stroke="var(--color-paper-3)" strokeWidth="5" />
      {accuracy !== null && (
        <circle
          cx="24"
          cy="24"
          r={r}
          fill="none"
          stroke={stroke}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={`${c * accuracy} ${c}`}
        />
      )}
    </svg>
  );
}

/** Tufte-style sparkline of cumulative accuracy over time. */
export function Sparkline({
  series,
  width = 200,
  height = 44,
  className,
}: {
  series: Array<{ year: number; accuracy: number }>;
  width?: number;
  height?: number;
  className?: string;
}) {
  if (series.length < 2) {
    return (
      <div className={cn("text-xs text-muted-foreground", className)}>
        Accuracy trend appears after multiple resolution years.
      </div>
    );
  }
  const pad = 4;
  const xs = series.map((_, i) => pad + (i * (width - 2 * pad)) / (series.length - 1));
  const ys = series.map((p) => height - pad - p.accuracy * (height - 2 * pad));
  const points = xs.map((x, i) => `${x},${ys[i]}`).join(" ");
  const last = series[series.length - 1];
  return (
    <div className={cn("flex items-end gap-2 min-w-0", className)}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: "100%", maxWidth: width, height: "auto" }}
        className="min-w-0 flex-1"
      >
        <line
          x1={pad}
          x2={width - pad}
          y1={height - pad - 0.5 * (height - 2 * pad)}
          y2={height - pad - 0.5 * (height - 2 * pad)}
          stroke="var(--border)"
          strokeDasharray="2 3"
        />
        <polyline
          points={points}
          fill="none"
          stroke="var(--foreground)"
          strokeWidth="1.5"
        />
        <circle
          cx={xs[xs.length - 1]}
          cy={ys[ys.length - 1]}
          r="2.5"
          fill="var(--foreground)"
        />
      </svg>
      <div className="text-xs text-muted-foreground leading-tight">
        <div className="font-mono font-medium text-foreground">
          {pct(last.accuracy)}
        </div>
        <div>
          {series[0].year}–{last.year}
        </div>
      </div>
    </div>
  );
}
