import cors from "cors";
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = Number(process.env.PORT) || 3001;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";
const DATA_PATH = path.join(__dirname, "data", "projects.json");
const CLIENT_DIST = path.join(__dirname, "..", "client", "dist");
const PUBLIC_DIR = path.join(__dirname, "public");
const TEXTURES_DIR = path.join(PUBLIC_DIR, "assets", "textures");
const MODELS_DIR = path.join(PUBLIC_DIR, "assets", "models");

function loadProjects() {
  const raw = fs.readFileSync(DATA_PATH, "utf8");
  return JSON.parse(raw);
}

function projectListItem(p) {
  return {
    slug: p.slug,
    title: p.title,
    year: p.year,
    role: p.role,
    summary: p.summary,
    tags: p.tags,
  };
}

const app = express();

app.use(
  cors({
    origin: CLIENT_ORIGIN.split(",").map((s) => s.trim()),
    credentials: false,
  }),
);
app.use(express.json({ limit: "256kb" }));

/* ── API: health ── */
app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

/* ── API: projects ── */
app.get("/api/projects", (_req, res) => {
  try {
    const projects = loadProjects();
    res.json(projects.map(projectListItem));
  } catch (e) {
    res.status(500).json({ error: "Could not load projects" });
  }
});

app.get("/api/projects/:slug", (req, res) => {
  try {
    const projects = loadProjects();
    const found = projects.find((p) => p.slug === req.params.slug);
    if (!found) {
      res.status(404).json({ error: "Project not found" });
      return;
    }
    res.json(found);
  } catch (e) {
    res.status(500).json({ error: "Could not load project" });
  }
});

/* ── API: 3D assets ── */
app.get("/api/assets/textures", (_req, res) => {
  try {
    if (!fs.existsSync(TEXTURES_DIR)) {
      res.json([]);
      return;
    }
    const files = fs.readdirSync(TEXTURES_DIR).filter((f) => /\.(png|jpg|jpeg|webp|svg)$/i.test(f));
    const items = files.map((name) => {
      const stat = fs.statSync(path.join(TEXTURES_DIR, name));
      return { name, size: stat.size, url: `/assets/textures/${name}` };
    });
    res.json(items);
  } catch (e) {
    res.status(500).json({ error: "Could not list textures" });
  }
});

app.get("/api/assets/models", (_req, res) => {
  try {
    if (!fs.existsSync(MODELS_DIR)) {
      res.json([]);
      return;
    }
    const files = fs.readdirSync(MODELS_DIR).filter((f) => /\.(glb|gltf)$/i.test(f));
    const items = files.map((name) => {
      const stat = fs.statSync(path.join(MODELS_DIR, name));
      return { name, size: stat.size, url: `/assets/models/${name}` };
    });
    res.json(items);
  } catch (e) {
    res.status(500).json({ error: "Could not list models" });
  }
});

/* ── Static: 3D assets ── */
app.use("/assets", express.static(path.join(PUBLIC_DIR, "assets"), {
  maxAge: "1d",
  immutable: false,
}));

/* ── Static: client SPA (production) ── */
const indexHtml = path.join(CLIENT_DIST, "index.html");
if (fs.existsSync(indexHtml)) {
  app.use(express.static(CLIENT_DIST, { index: false }));
  app.get(/^(?!\/api\/|\/assets\/).*/, (_req, res) => {
    res.sendFile(indexHtml);
  });
}

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
  if (fs.existsSync(indexHtml)) {
    console.log(`Serving static from ${CLIENT_DIST}`);
  }
});
