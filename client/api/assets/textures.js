import { readdirSync, statSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEXTURES_DIR = join(__dirname, "..", "..", "public", "assets", "textures");

export default function handler(req, res) {
  try {
    const files = readdirSync(TEXTURES_DIR).filter((f) =>
      /\.(png|jpg|jpeg|webp|svg)$/i.test(f),
    );
    const items = files.map((name) => {
      const stat = statSync(join(TEXTURES_DIR, name));
      return { name, size: stat.size, url: `/assets/textures/${name}` };
    });
    res.json(items);
  } catch {
    res.json([]);
  }
}
