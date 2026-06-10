import { readFile } from "node:fs/promises";
import path from "node:path";

/** Load a /public image as a data URI for use inside ImageResponse JSX. */
export async function publicImageDataUri(
  publicPath: string | null | undefined,
): Promise<string | null> {
  if (!publicPath) return null;
  try {
    const file = path.join(process.cwd(), "public", publicPath);
    const buf = await readFile(file);
    const ext = path.extname(file).slice(1) || "jpeg";
    const mime = ext === "jpg" ? "jpeg" : ext;
    return `data:image/${mime};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}
