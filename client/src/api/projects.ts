import type { ProjectDetail, ProjectListItem } from "../types/project";

async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!res.ok) {
    let message = res.statusText || "Request failed";
    try {
      const err = JSON.parse(text) as { error?: string };
      if (err?.error) message = err.error;
    } catch {
      if (text) message = text.slice(0, 120);
    }
    throw new Error(message);
  }
  return JSON.parse(text) as T;
}

export function fetchProjectList(): Promise<ProjectListItem[]> {
  return fetch("/api/projects").then((res) => parseJson<ProjectListItem[]>(res));
}

export function fetchProjectDetail(slug: string): Promise<ProjectDetail> {
  return fetch(`/api/projects/${encodeURIComponent(slug)}`).then((res) =>
    parseJson<ProjectDetail>(res),
  );
}
