"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import JSZip from "jszip";
import TopLinks from "./components/TopLinks";
import HeaderSection from "./components/HeaderSection";
import ControlsBar from "./components/ControlsBar";
import EditorPane from "./components/EditorPane";
import { styles } from "./styles";
import {
  ImageAsset,
  ensureExt,
  fileToDataUrl,
  encodeBase64Url,
  slugifyFilename,
  toDocsPath
} from "./utils";

export default function MarkdownStudioPage(): React.ReactElement {
  const uploadApiUrl = useMemo(
    () => (typeof window !== "undefined" ? process.env.NEXT_PUBLIC_UPLOAD_API_URL || "" : ""),
    []
  );

  const [initialMarkdown, setInitialMarkdown] = useState(
    `---\ntitle: ตัวอย่างหน้าเอกสาร\n---\n\n# เริ่มเขียนได้เลย\n`
  );

  const markdownRef = useRef(initialMarkdown);
  const imagesRef = useRef<Map<string, ImageAsset>>(new Map());
  const previewToFinalRef = useRef<Map<string, string>>(new Map());
  const [editorKey, setEditorKey] = useState(1);
  const [filename, setFilename] = useState("new-doc.md");
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [fileHovered, setFileHovered] = useState(false);
  const [shareStatus, setShareStatus] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      for (const asset of imagesRef.current.values()) {
        URL.revokeObjectURL(asset.previewUrl);
      }
      imagesRef.current.clear();
      previewToFinalRef.current.clear();
    };
  }, []);

  const onExportZip = useCallback(async () => {
    const zip = new JSZip();
    let md = markdownRef.current;
    for (const [previewUrl, finalSrc] of previewToFinalRef.current.entries()) {
      md = md.split(previewUrl).join(finalSrc);
    }
    zip.file(toDocsPath(filename), md);

    for (const [safeName, asset] of imagesRef.current.entries()) {
      if (asset.file) {
        zip.file(`static/img/uploads/${safeName}`, await asset.file.arrayBuffer());
      }
    }

    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;

    const base = ensureExt(filename).replace(/\.(md|mdx)$/i, "");
    a.download = `${slugifyFilename(base) || "export"}.zip`;
    a.click();

    URL.revokeObjectURL(url);
  }, [filename]);

  const onShareLink = useCallback(async () => {
    const origin = window.location.origin;
    let md = markdownRef.current || "";

    for (const asset of imagesRef.current.values()) {
      if (asset.file) {
        const dataUrl = await fileToDataUrl(asset.file);
        md = md.split(asset.previewUrl).join(dataUrl);
        md = md.split(asset.finalSrc).join(dataUrl);
      } else {
        md = md.split(asset.previewUrl).join(asset.finalSrc);
      }
    }

    const encoded = encodeBase64Url(md);
    const url = `${origin}/tools/markdown/viewer?doc=${encoded}`;

    try {
      await navigator.clipboard.writeText(url);
      setShareStatus("คัดลอกลิงก์แชร์แล้ว");
    } catch {
      setShareStatus("ไม่สามารถคัดลอกอัตโนมัติได้");
    }
  }, []);

  const onImport = useCallback(async (file: File) => {
    const text = await file.text();
    setInitialMarkdown(text);
    markdownRef.current = text;

    setFilename(file.name.endsWith(".md") || file.name.endsWith(".mdx") ? file.name : "imported.md");

    for (const asset of imagesRef.current.values()) {
      URL.revokeObjectURL(asset.previewUrl);
    }
    imagesRef.current.clear();
    previewToFinalRef.current.clear();

    setEditorKey((k) => k + 1);
  }, []);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <TopLinks />
        <HeaderSection />

        <ControlsBar
          filename={filename}
          onFilenameChange={setFilename}
          onExport={() => void onExportZip()}
          onShare={() => void onShareLink()}
          onImport={(file) => void onImport(file)}
          imageCount={imagesRef.current.size}
          hoveredButton={hoveredButton}
          setHoveredButton={setHoveredButton}
          fileHovered={fileHovered}
          setFileHovered={setFileHovered}
        />

        {shareStatus && <div style={{ ...styles.helper, ...styles.helperSuccess }}>{shareStatus}</div>}

        <EditorPane
          editorKey={editorKey}
          markdown={initialMarkdown}
          onChange={(value) => {
            markdownRef.current = value;
          }}
          onImagePicked={(file) => {
            const safe = slugifyFilename(file.name || "image.png") || "image.png";
            const previewUrl = URL.createObjectURL(file);

            const prev = imagesRef.current.get(safe);
            if (prev) {
              URL.revokeObjectURL(prev.previewUrl);
              previewToFinalRef.current.delete(prev.previewUrl);
            }

            const uploadUrl = uploadApiUrl || `${window.location.origin}/api/upload`;
            const form = new FormData();
            form.append("file", file);

            return fetch(uploadUrl, { method: "POST", body: form })
              .then(async (res) => {
                if (!res.ok) throw new Error("upload failed");
                const json = (await res.json()) as { url: string };
                const finalSrc = json.url;
                imagesRef.current.set(safe, { file, previewUrl, finalSrc });
                previewToFinalRef.current.set(previewUrl, finalSrc);
                return finalSrc;
              })
              .catch(() => {
                imagesRef.current.set(safe, { file, previewUrl, finalSrc: previewUrl });
                previewToFinalRef.current.set(previewUrl, previewUrl);
                return previewUrl;
              });
          }}
        />
      </div>
    </div>
  );
}
