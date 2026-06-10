import { ImageResponse } from "next/og";
import { getClaim } from "@/lib/queries";
import { STATUS_META } from "@/lib/status";
import { fmtDate } from "@/lib/format";
import { publicImageDataUri } from "@/lib/og-image";

export const dynamic = "force-dynamic";

const STATUS_COLORS: Record<string, { fg: string; bg: string }> = {
  pending: { fg: "#2f4d75", bg: "#e7ecf4" },
  came_true: { fg: "#155c39", bg: "#e6f1ea" },
  partly_true: { fg: "#7a520c", bg: "#f6eed8" },
  didnt_come_true: { fg: "#8c2c24", bg: "#f7e4e1" },
  walked_back: { fg: "#523f73", bg: "#ece6f3" },
  unverifiable: { fg: "#5e594f", bg: "#eceae3" },
  disputed: { fg: "#6d531a", bg: "#f4eed9" },
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const claim = await getClaim(slug);
  if (!claim) return new Response("Not found", { status: 404 });

  const first = [...claim.stances].sort((a, b) =>
    a.dateStated.localeCompare(b.dateStated),
  )[0];
  const colors = STATUS_COLORS[claim.status];
  const photo = await publicImageDataUri(first?.person.imageUrl);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#faf9f6",
          color: "#201e1b",
          padding: 56,
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", fontSize: 28, fontWeight: 700 }}>
            <span
              style={{
                display: "flex",
                width: 36,
                height: 36,
                marginRight: 12,
                borderRadius: 8,
                backgroundColor: "#201e1b",
                color: "#faf9f6",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
              }}
            >
              [·]
            </span>
            SmartHumans
          </div>
          <div
            style={{
              display: "flex",
              backgroundColor: colors.bg,
              color: colors.fg,
              borderRadius: 999,
              padding: "10px 28px",
              fontSize: 30,
              fontWeight: 700,
            }}
          >
            {STATUS_META[claim.status].label}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          {first && (
            <div
              style={{
                display: "flex",
                fontSize: first.quote.length > 140 ? 34 : 42,
                fontStyle: "italic",
                lineHeight: 1.3,
                borderLeft: "8px solid #111",
                paddingLeft: 32,
              }}
            >
              “{first.quote.length > 220 ? first.quote.slice(0, 217) + "…" : first.quote}”
            </div>
          )}
          {first && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                marginTop: 28,
                paddingLeft: 40,
                fontSize: 26,
                color: "#555",
              }}
            >
              {photo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photo}
                  alt={first.person.name}
                  width={56}
                  height={56}
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 999,
                    objectFit: "cover",
                  }}
                />
              )}
              — {first.person.name}, {fmtDate(first.dateStated)} · {first.venue}
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 22,
            color: "#777",
          }}
        >
          <div style={{ display: "flex" }}>
            {claim.question || claim.statement}
          </div>
          <div style={{ display: "flex" }}>
            {claim.followerCount.toLocaleString()} following
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
