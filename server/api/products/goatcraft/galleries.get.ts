import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { existsSync } from "node:fs";

const IMAGE_EXT = /\.(png|jpe?g|webp|gif|avif)$/i;
const PUBLIC_URL_PREFIX = "/images/goatcraft/galleries";

function resolveGalleriesRoot(): string | null {
  const candidates = [
    join(process.cwd(), "public", "images", "goatcraft", "galleries"),
    join(process.cwd(), ".output", "public", "images", "goatcraft", "galleries"),
  ];
  for (const dir of candidates) {
    if (existsSync(dir)) return dir;
  }
  return null;
}

async function listImagesInDir(dir: string, periodId: string): Promise<string[]> {
  let entries: string[];
  try {
    entries = await readdir(dir);
  } catch {
    return [];
  }

  return entries
    .filter((name) => IMAGE_EXT.test(name) && !name.startsWith("."))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map(
      (name) =>
        `${PUBLIC_URL_PREFIX}/${encodeURIComponent(periodId)}/${encodeURIComponent(name)}`,
    );
}

export default defineEventHandler(async () => {
  const root = resolveGalleriesRoot();
  if (!root) {
    return { periods: [] as { id: string; images: string[] }[] };
  }

  let periodDirs: string[];
  try {
    periodDirs = (await readdir(root, { withFileTypes: true }))
      .filter((d) => d.isDirectory() && /^period\d+$/i.test(d.name))
      .map((d) => d.name)
      .sort((a, b) => {
        const na = Number(a.replace(/\D/g, "")) || 0;
        const nb = Number(b.replace(/\D/g, "")) || 0;
        return na - nb;
      });
  } catch {
    return { periods: [] as { id: string; images: string[] }[] };
  }

  const periods = await Promise.all(
    periodDirs.map(async (id) => ({
      id,
      images: await listImagesInDir(join(root, id), id),
    })),
  );

  return { periods };
});
