"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { decompressFromEncodedURIComponent } from "lz-string";
import { decodeBase64Url } from "../utils";
import { loadDraft } from "../drafts";

export default function MarkdownViewerClient(): React.ReactElement {
  const searchParams = useSearchParams();
  const docParam = searchParams.get("doc") || "";
  const idParam = searchParams.get("id") || "";
  const [content, setContent] = useState<string>("");

  useEffect(() => {
    if (idParam) {
      void loadDraft(idParam)
        .then((draft) => setContent(draft.markdown))
        .catch(() => setContent(""));
      return;
    }

    const decompressed = decompressFromEncodedURIComponent(docParam || "");
    if (decompressed) {
      setContent(decompressed);
      return;
    }
    setContent(decodeBase64Url(docParam));
  }, [docParam, idParam]);

  const html = useMemo(() => {
    if (!content) return "";
    const raw = marked.parse(content);
    return DOMPurify.sanitize(String(raw));
  }, [content]);

  return (
    <main style={{ padding: "32px 24px", maxWidth: 900, margin: "0 auto" }}>
      <a className="button" href="/tools/markdown">
        กลับไปแก้ไข
      </a>
      <h1 style={{ marginTop: 20 }}>Markdown Viewer</h1>
      <p style={{ color: "var(--ink-2)" }}>ลิงก์นี้แสดง Markdown แบบอ่านอย่างเดียว</p>
      <div
        style={{
          background: "rgba(10, 18, 40, 0.8)",
          border: "1px solid var(--line)",
          borderRadius: 16,
          padding: 20,
          color: "var(--ink-0)",
          lineHeight: 1.7
        }}
        className="viewer-content"
        dangerouslySetInnerHTML={{ __html: html || "<p>ไม่พบเนื้อหา</p>" }}
      />
    </main>
  );
}
