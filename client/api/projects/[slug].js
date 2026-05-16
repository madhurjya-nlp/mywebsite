import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = join(__dirname, "..", "data", "projects.json");

function loadProjects() {
  const raw = readFileSync(DATA_PATH, "utf8");
  return JSON.parse(raw);
}

export default function handler(req, res) {
  try {
    const projects = loadProjects();
    const found = projects.find((p) => p.slug === req.query.slug);
    if (!found) {
      res.status(404).json({ error: "Project not found" });
      return;
    }
    res.json(found);
  } catch {
    res.status(500).json({ error: "Could not load project" });
  }
}
