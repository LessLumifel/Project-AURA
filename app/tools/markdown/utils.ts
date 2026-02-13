export type ImageAsset = { file?: File; previewUrl: string; finalSrc: string; uploaded: boolean };

export function slugifyFilename(name: string) {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9.\-_]/g, "");
}

export function getFileExt(name: string) {
  const dotIndex = name.lastIndexOf(".");
  if (dotIndex <= 0 || dotIndex === name.length - 1) return "";
  return name.slice(dotIndex + 1).toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function getBaseName(name: string) {
  const dotIndex = name.lastIndexOf(".");
  return dotIndex > 0 ? name.slice(0, dotIndex) : name;
}

function createShortToken() {
  const random = Math.floor(Math.random() * 0xffffffff);
  return random.toString(36).slice(0, 6);
}

function toToken(input: string, fallback: string, max = 24) {
  const token = slugifyFilename(input)
    .replace(/\./g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
  return (token || fallback).slice(0, max);
}

export function buildUploadImageName(sourceName: string, docName?: string) {
  const ext = getFileExt(sourceName) || "bin";
  const sourceBase = toToken(getBaseName(sourceName), "image");
  const docBase = toToken(getBaseName(docName || ""), "doc");
  const now = new Date();
  const y = String(now.getFullYear());
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");
  const stamp = `${y}${m}${d}-${hh}${mm}${ss}`;
  return `aura-markdown-${docBase}-${sourceBase}-system-${stamp}-${createShortToken()}.${ext}`;
}

export function ensureExt(filename: string) {
  if (filename.endsWith(".md") || filename.endsWith(".mdx")) return filename;
  return `${filename}.md`;
}

export function toDocsPath(filename: string) {
  return `docs/${ensureExt(filename)}`;
}

export function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function encodeBase64Url(input: string) {
  const bytes = new TextEncoder().encode(input);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export function decodeBase64Url(input: string) {
  try {
    const padded = input.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(input.length / 4) * 4, "=");
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  } catch {
    return "";
  }
}
