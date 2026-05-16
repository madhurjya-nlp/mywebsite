import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = join(__dirname, "data", "projects.json");

function loadProjects() {
  const raw = readFileSync(DATA_PATH, "utf8");
  return JSON.parse(raw);
}

function listItem(p) {
  return {
    slug: p.slug,
    title: p.title,
    year: p.year,
    role: p.role,
    summary: p.summary,
    tags: p.tags,
  };
}

export default function handler(req, res) {
  try {
    const projects = loadProjects();
    res.json(projects.map(listItem));
  } catch {
    res.status(500).json({ error: "Could not load projects" });
  }
}
