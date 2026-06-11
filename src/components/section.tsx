import Link from "next/link";

/**
 * The one section-header pattern, site-wide: small-caps sans heading +
 * hairline rule, content on the page background. Boxes are reserved for
 * claim/figure cards and "active" widgets.
 */
export function Section({
  title,
  sub,
  href,
  linkLabel = "More",
  aside,
  className = "mt-12",
  children,
}: {
  title: string;
  sub?: string;
  href?: string;
  linkLabel?: string;
  aside?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={className}>
      <div className="flex items-baseline justify-between gap-3 border-b pb-2">
        <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {title}
          {sub && (
            <span className="ml-2 font-normal normal-case tracking-normal">
              {sub}
            </span>
          )}
        </h2>
        {aside ??
          (href && (
            <Link
              href={href}
              className="text-xs text-muted-foreground hover:text-foreground whitespace-nowrap"
            >
              {linkLabel} →
            </Link>
          ))}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}
