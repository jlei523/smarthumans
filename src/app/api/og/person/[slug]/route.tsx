import { ImageResponse } from "next/og";
import { getPersonScore } from "@/lib/queries";
import { publicImageDataUri } from "@/lib/og-image";

export const dynamic = "force-dynamic";

const SEGMENTS: Array<{ key: "correct" | "partly" | "incorrect" | "walkedBack" | "pending"; color: string; label: string }> = [
  { key: "correct", color: "#1c7a4c", label: "came true" },
  { key: "partly", color: "#9c6a11", label: "partly" },
  { key: "incorrect", color: "#b23a30", label: "didn't" },
  { key: "walkedBack", color: "#6a548f", label: "walked back" },
  { key: "pending", color: "#3d6294", label: "pending" },
];

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const score = await getPersonScore(slug);
  if (!score) return new Response("Not found", { status: 404 });
  const { person, scorecard } = score;
  const accuracy =
    scorecard.accuracy === null
      ? "—"
      : `${Math.round(scorecard.accuracy * 100)}%`;
  const initials = person.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");
  const photo = await publicImageDataUri(person.imageUrl);

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

        <div style={{ display: "flex", alignItems: "center", marginTop: 48, gap: 36 }}>
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photo}
              alt={person.name}
              width={140}
              height={140}
              style={{
                width: 140,
                height: 140,
                borderRadius: 999,
                objectFit: "cover",
              }}
            />
          ) : (
            <div
              style={{
                display: "flex",
                width: 140,
                height: 140,
                borderRadius: 999,
                backgroundColor: "#111",
                color: "#fff",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 56,
                fontWeight: 700,
              }}
            >
              {initials}
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 54, fontWeight: 700 }}>
              {person.name}
            </div>
            <div style={{ display: "flex", fontSize: 28, color: "#666" }}>
              {person.title}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginLeft: "auto",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", fontSize: 80, fontWeight: 700 }}>
              {accuracy}
            </div>
            <div style={{ display: "flex", fontSize: 24, color: "#666" }}>
              accuracy · {scorecard.resolved} resolved
            </div>
          </div>
        </div>

        <div style={{ display: "flex", marginTop: 72, fontSize: 26, color: "#444", gap: 28 }}>
          {SEGMENTS.filter((s) => scorecard[s.key] > 0).map((s) => (
            <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  display: "flex",
                  width: 16,
                  height: 16,
                  borderRadius: 999,
                  backgroundColor: s.color,
                }}
              />
              {scorecard[s.key]} {s.label}
            </div>
          ))}
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
