import { readdirSync, statSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const MODELS_DIR = join(__dirname, "..", "..", "public", "assets", "models");

export default function handler(req, res) {
  try {
    const files = readdirSync(MODELS_DIR).filter((f) =>
      /\.(glb|gltf)$/i.test(f),
    );
    const items = files.map((name) => {
      const stat = statSync(join(MODELS_DIR, name));
      return { name, size: stat.size, url: `/assets/models/${name}` };
    });
    res.json(items);
  } catch {
    res.json([]);
  }
}
