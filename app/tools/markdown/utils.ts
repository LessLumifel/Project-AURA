export type ImageAsset = { file?: File; previewUrl: string; finalSrc: string };

export function slugifyFilename(name: string) {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9.\-_]/g, "");
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
