/**
 * The SmartHumans mark — "the bracketed claim": a statement entered on the
 * record until it resolves. Single-ink, legible to 16px. (Logo spec v2 #4.)
 */
export function BrandMark({
  size = 24,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={(size * 34) / 32}
      viewBox="0 0 32 34"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ flex: "none" }}
      aria-hidden
    >
      <path d="M11 6 H6.5 V28 H11" />
      <path d="M21 6 H25.5 V28 H21" />
      <circle cx="16" cy="17" r="2.8" fill="currentColor" stroke="none" />
    </svg>
  );
}
