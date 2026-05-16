type TextureAsset = {
  name: string;
  size: number;
  url: string;
};

type ModelAsset = {
  name: string;
  size: number;
  url: string;
};

export async function fetchTextureList(): Promise<TextureAsset[]> {
  const res = await fetch("/api/assets/textures");
  if (!res.ok) throw new Error("Failed to fetch texture list");
  return res.json();
}

export async function fetchModelList(): Promise<ModelAsset[]> {
  const res = await fetch("/api/assets/models");
  if (!res.ok) throw new Error("Failed to fetch model list");
  return res.json();
}
