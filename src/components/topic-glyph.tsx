import type { Category } from "@/db/schema";

/** Minimal geometric topic glyphs (simple shapes only). */
export function TopicGlyph({
  category,
  size = 22,
}: {
  category: Category;
  size?: number;
}) {
  const p = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (category) {
    case "ai":
      return (
        <svg {...p}>
          <rect x="6" y="6" width="12" height="12" rx="3" />
          <circle cx="10" cy="11" r="0.6" fill="currentColor" />
          <circle cx="14" cy="11" r="0.6" fill="currentColor" />
          <path d="M10 15h4M12 2v4M12 18v4M2 12h4M18 12h4" />
        </svg>
      );
    case "markets":
      return (
        <svg {...p}>
          <path d="M3 17l5-5 4 3 6-7" />
          <path d="M18 8h3v3" />
          <path d="M2 21h20" />
        </svg>
      );
    case "stocks":
      return (
        <svg {...p}>
          <path d="M4 20V10M10 20V5M16 20v-8M22 20H2" />
        </svg>
      );
    case "semiconductors":
      return (
        <svg {...p}>
          <rect x="6" y="6" width="12" height="12" rx="2" />
          <rect x="10" y="10" width="4" height="4" />
          <path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" />
        </svg>
      );
    case "gold":
      return (
        <svg {...p}>
          <path d="M7 9h7l2 5H5zM10 4h7l2 5h-7z" />
          <path d="M2 19h20" />
        </svg>
      );
    case "economy":
      return (
        <svg {...p}>
          <circle cx="12" cy="12" r="9" />
          <path d="M15 9.5c-.5-1-1.6-1.5-3-1.5-1.7 0-3 .8-3 2s1.2 1.7 3 2 3 .8 3 2-1.3 2-3 2c-1.4 0-2.5-.5-3-1.5M12 6v2M12 16v2" />
        </svg>
      );
    case "health":
      return (
        <svg {...p}>
          <path d="M12 6v12M6 12h12" />
          <circle cx="12" cy="12" r="9.5" />
        </svg>
      );
    case "immigration":
      return (
        <svg {...p}>
          <path d="M5 21V4M5 4c4-2 8 2 12 0v9c-4 2-8-2-12 0" />
        </svg>
      );
    case "foreign_policy":
      return (
        <svg {...p}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" />
        </svg>
      );
    case "nba":
      return (
        <svg {...p}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3v18M5.5 5.5c3 3 3 10 0 13M18.5 5.5c-3 3-3 10 0 13" />
        </svg>
      );
    case "mlb":
      return (
        <svg {...p}>
          <circle cx="12" cy="12" r="9" />
          <path d="M6 5c2 2 2 12 0 14M18 5c-2 2-2 12 0 14" />
        </svg>
      );
    case "nfl":
      return (
        <svg {...p}>
          <ellipse cx="12" cy="12" rx="9.5" ry="6" transform="rotate(-35 12 12)" />
          <path d="M9.5 14.5l5-5M9.5 11.5l3 3M11 10l3 3" />
        </svg>
      );
    case "f1":
      return (
        <svg {...p}>
          <path d="M4 5h16v10H4z" />
          <path d="M4 10h16M9.3 5v10M14.6 5v10" />
          <path d="M4 5v16" />
        </svg>
      );
    default:
      return (
        <svg {...p}>
          <circle cx="12" cy="12" r="9" />
        </svg>
      );
  }
}
