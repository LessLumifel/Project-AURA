"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";

function decodeBase64Url(input: string) {
  try {
    const padded = input
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(Math.ceil(input.length / 4) * 4, "=");
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  } catch {
    return "";
  }
}

export default function MarkdownViewerClient(): React.ReactElement {
  const searchParams = useSearchParams();
  const docParam = searchParams.get("doc") || "";

  const content = useMemo(() => decodeBase64Url(docParam), [docParam]);

  return (
    <main style={{ padding: "32px 24px", maxWidth: 900, margin: "0 auto" }}>
      <a className="button" href="/tools/markdown">
        กลับไปแก้ไข
      </a>
      <h1 style={{ marginTop: 20 }}>Markdown Viewer</h1>
      <p style={{ color: "var(--ink-2)" }}>ลิงก์นี้แสดง Markdown แบบอ่านอย่างเดียว</p>
      <pre
        style={{
          whiteSpace: "pre-wrap",
          background: "rgba(10, 18, 40, 0.8)",
          border: "1px solid var(--line)",
          borderRadius: 16,
          padding: 20,
          color: "var(--ink-0)"
        }}
      >
        {content || "ไม่พบเนื้อหา"}
      </pre>
    </main>
  );
}
