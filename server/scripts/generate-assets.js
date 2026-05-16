import zlib from "zlib";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, "..", "public");
const TEXTURES_DIR = path.join(PUBLIC_DIR, "assets", "textures");
const MODELS_DIR = path.join(PUBLIC_DIR, "assets", "models");

const CRC_TABLE = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  CRC_TABLE[i] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const t = Buffer.from(type, "ascii");
  const crcInput = Buffer.concat([t, data]);
  const crc = crc32(crcInput);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc, 0);
  return Buffer.concat([len, t, data, crcBuf]);
}

function createPNG(width, height, pixels) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const ihdrChunk = createChunk("IHDR", ihdr);
  const stride = 1 + width * 4;
  const raw = Buffer.alloc(height * stride);
  for (let y = 0; y < height; y++) {
    raw[y * stride] = 0;
    for (let x = 0; x < width; x++) {
      const si = (y * width + x) * 4;
      const di = y * stride + 1 + x * 4;
      raw[di] = pixels[si];
      raw[di + 1] = pixels[si + 1];
      raw[di + 2] = pixels[si + 2];
      raw[di + 3] = pixels[si + 3];
    }
  }
  const compressed = zlib.deflateSync(raw, { level: 9 });
  const idatChunk = createChunk("IDAT", compressed);
  const iendChunk = createChunk("IEND", Buffer.alloc(0));
  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

function fillGradient(pixels, width, height, c1, c2, vertical) {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const t = vertical ? y / height : x / width;
      const i = (y * width + x) * 4;
      pixels[i] = Math.round(c1[0] + (c2[0] - c1[0]) * t);
      pixels[i + 1] = Math.round(c1[1] + (c2[1] - c1[1]) * t);
      pixels[i + 2] = Math.round(c1[2] + (c2[2] - c1[2]) * t);
      pixels[i + 3] = 255;
    }
  }
}

function fillNoise(pixels, width, height, base, range) {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const n = Math.floor(base + (Math.random() - 0.5) * range);
      const v = Math.max(0, Math.min(255, n));
      pixels[i] = v;
      pixels[i + 1] = v;
      pixels[i + 2] = v;
      pixels[i + 3] = 255;
    }
  }
}

function fillGrid(pixels, width, height, gridSize, lineWidth, color, bg) {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const onGrid =
        x % gridSize < lineWidth || y % gridSize < lineWidth;
      if (onGrid) {
        pixels[i] = color[0];
        pixels[i + 1] = color[1];
        pixels[i + 2] = color[2];
      } else {
        pixels[i] = bg[0];
        pixels[i + 1] = bg[1];
        pixels[i + 2] = bg[2];
      }
      pixels[i + 3] = 255;
    }
  }
}

function fillMarble(pixels, width, height) {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const v =
        Math.sin(x * 0.05 + Math.sin(y * 0.03) * 1.5) * 0.5 +
        Math.sin(y * 0.04 + Math.sin(x * 0.06) * 1.2) * 0.5;
      const t = v * 0.5 + 0.5;
      pixels[i] = Math.round(20 + t * 35);
      pixels[i + 1] = Math.round(15 + t * 28);
      pixels[i + 2] = Math.round(30 + t * 40);
      pixels[i + 3] = 255;
    }
  }
}

function generateTextures() {
  fs.mkdirSync(TEXTURES_DIR, { recursive: true });

  const textures = {
    "gradient-dark.png": (w, h) => {
      const p = new Uint8Array(w * h * 4);
      fillGradient(p, w, h, [15, 8, 30], [5, 5, 20], true);
      return createPNG(w, h, p);
    },
    "gradient-cyan.png": (w, h) => {
      const p = new Uint8Array(w * h * 4);
      fillGradient(p, w, h, [10, 25, 35], [5, 10, 25], false);
      return createPNG(w, h, p);
    },
    "noise-subtle.png": (w, h) => {
      const p = new Uint8Array(w * h * 4);
      fillNoise(p, w, h, 20, 12);
      return createPNG(w, h, p);
    },
    "grid-subtle.png": (w, h) => {
      const p = new Uint8Array(w * h * 4);
      fillGrid(p, w, h, 32, 1, [196, 181, 253], [3, 3, 3]);
      return createPNG(w, h, p);
    },
    "marble-dark.png": (w, h) => {
      const p = new Uint8Array(w * h * 4);
      fillMarble(p, w, h);
      return createPNG(w, h, p);
    },
  };

  for (const [name, fn] of Object.entries(textures)) {
    const p = fn(512, 512);
    fs.writeFileSync(path.join(TEXTURES_DIR, name), p);
    console.log(`  ✓ ${name}`);
  }
}

function generateModels() {
  fs.mkdirSync(MODELS_DIR, { recursive: true });

  const readme = `Place .glb or .gltf model files in this directory.

Public domain / CC0 model sources:
  • https://polyhaven.com/models
  • https://sketchfab.com/3d-models (filter by CC0)
  • https://github.com/KhronosGroup/glTF-Sample-Assets
`;
  fs.writeFileSync(path.join(MODELS_DIR, "README.txt"), readme);
  console.log("  ✓ README.txt (model directory)");
}

console.log("Generating 3D assets…\n");

console.log("Textures:");
generateTextures();

console.log("\nModels:");
generateModels();

console.log("\nDone. Assets ready in server/public/assets/");
