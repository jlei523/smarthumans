import { ImageResponse } from "next/og";
import { headers } from "next/headers";
import { db } from "@/db";
import { people } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { getHeadToHead } from "@/lib/queries";
import { publicImageDataUri } from "@/lib/og-image";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return new Response("Sign in required", { status: 401 });

  const person = await db.query.people.findFirst({
    where: eq(people.slug, slug),
  });
  if (!person) return new Response("Not found", { status: 404 });
  const h2h = await getHeadToHead(session.user.id, person.id);
  const photo = await publicImageDataUri(person.imageUrl);
  const winning = h2h.me > h2h.them;

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
        <div style={{ display: "flex", alignItems: "center", fontSize: 28, fontWeight: 700 }}>
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
          SmartHumans · Head to head
        </div>

        <div
          style={{
            display: "flex",
            flex: 1,
            alignItems: "center",
            justifyContent: "space-between",
            gap: 40,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
            <div
              style={{
                display: "flex",
                width: 120,
                height: 120,
                borderRadius: 999,
                backgroundColor: "#201e1b",
                color: "#faf9f6",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 44,
                fontWeight: 700,
              }}
            >
              {session.user.name.slice(0, 2).toUpperCase()}
            </div>
            <div style={{ display: "flex", marginTop: 16, fontSize: 30, fontWeight: 700 }}>
              @{session.user.name}
            </div>
            <div style={{ display: "flex", marginTop: 18, fontSize: 96, fontWeight: 700, color: winning ? "#1c7a4c" : "#56524b" }}>
              {h2h.me}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ display: "flex", fontSize: 30, color: "#6c675c" }}>vs</div>
            <div style={{ display: "flex", marginTop: 10, fontSize: 22, color: "#56524b", textAlign: "center" }}>
              right on {h2h.shared} shared calls
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photo}
                alt={person.name}
                width={120}
                height={120}
                style={{ width: 120, height: 120, borderRadius: 999, objectFit: "cover" }}
              />
            ) : (
              <div
                style={{
                  display: "flex",
                  width: 120,
                  height: 120,
                  borderRadius: 999,
                  backgroundColor: "#efece4",
                  color: "#56524b",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 44,
                  fontWeight: 700,
                }}
              >
                {person.name
                  .split(" ")
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join("")}
              </div>
            )}
            <div style={{ display: "flex", marginTop: 16, fontSize: 30, fontWeight: 700 }}>
              {person.name}
            </div>
            <div style={{ display: "flex", marginTop: 18, fontSize: 96, fontWeight: 700, color: !winning && h2h.them !== h2h.me ? "#1c7a4c" : "#56524b" }}>
              {h2h.them}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "center", fontSize: 22, color: "#6c675c" }}>
          Every call sourced and scored at resolution · smarthumans.ai
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
