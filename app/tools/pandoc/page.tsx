"use client";

import { useMemo, useState } from "react";

type ConvertResult = {
  ok: boolean;
  markdown: string;
  uploadedCount: number;
  assets: Array<{ filename: string; key: string; url: string }>;
};

function downloadText(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function PandocToolPage(): React.ReactElement {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [result, setResult] = useState<ConvertResult | null>(null);

  const suggestedName = useMemo(() => {
    if (!file) return "converted.md";
    const base = file.name.replace(/\.docx$/i, "");
    return `${base || "converted"}.md`;
  }, [file]);

  const onConvert = async () => {
    if (!file) return;
    setLoading(true);
    setStatus("กำลังแปลงเอกสารด้วย Pandoc...");
    setResult(null);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("filename", file.name);
      const res = await fetch("/api/pandoc/convert", {
        method: "POST",
        body: form
      });
      const json = (await res.json()) as ConvertResult | { error?: string };
      if (!res.ok) {
        throw new Error((json as { error?: string }).error || "Convert failed");
      }
      setResult(json as ConvertResult);
      setStatus(`เสร็จแล้ว: อัปโหลดรูป ${((json as ConvertResult).uploadedCount || 0).toString()} รายการ`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Convert failed";
      setStatus(`ล้มเหลว: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: 1120, margin: "0 auto", padding: "28px 24px 40px", color: "var(--ink-0)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 30 }}>Pandoc Converter</h1>
          <p style={{ margin: "8px 0 0", color: "var(--ink-2)" }}>
            แปลงไฟล์ Word (.docx) เป็น Markdown และอัปโหลดรูปจาก Word เข้าระบบอัตโนมัติ
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <a className="button" href="/">
            กลับหน้าแรก
          </a>
          <a className="button" href="/tools/media">
            ไป Media Manager
          </a>
        </div>
      </div>

      <section
        style={{
          marginTop: 16,
          border: "1px solid var(--line)",
          borderRadius: 16,
          background: "rgba(12, 20, 44, 0.65)",
          padding: 16
        }}
      >
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <label className="button" style={{ cursor: "pointer" }}>
            เลือกไฟล์ .docx
            <input
              type="file"
              hidden
              accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={(event) => {
                const picked = event.target.files?.[0] || null;
                setFile(picked);
                setResult(null);
                setStatus("");
                event.target.value = "";
              }}
            />
          </label>
          <button className="button primary" disabled={!file || loading} onClick={() => void onConvert()}>
            {loading ? "กำลังแปลง..." : "Convert"}
          </button>
          <span style={{ color: "var(--ink-2)", fontSize: 14 }}>{file ? file.name : "ยังไม่ได้เลือกไฟล์"}</span>
        </div>
        {status ? <div style={{ marginTop: 10, color: "var(--ice-1)" }}>{status}</div> : null}
      </section>

      <section
        style={{
          marginTop: 16,
          border: "1px solid var(--line)",
          borderRadius: 16,
          background: "rgba(10, 18, 38, 0.9)",
          padding: 16
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <h2 style={{ margin: 0, fontSize: 20 }}>Markdown Output</h2>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              className="button"
              disabled={!result?.markdown}
              onClick={async () => {
                if (!result?.markdown) return;
                try {
                  await navigator.clipboard.writeText(result.markdown);
                  setStatus("คัดลอก markdown แล้ว");
                } catch {
                  setStatus("คัดลอกไม่สำเร็จ");
                }
              }}
            >
              Copy
            </button>
            <button
              className="button"
              disabled={!result?.markdown}
              onClick={() => {
                if (!result?.markdown) return;
                downloadText(suggestedName, result.markdown);
              }}
            >
              Download .md
            </button>
          </div>
        </div>
        <textarea
          value={result?.markdown || ""}
          readOnly
          placeholder="ผลลัพธ์ markdown จะแสดงที่นี่หลัง convert"
          style={{
            marginTop: 10,
            width: "100%",
            minHeight: 320,
            borderRadius: 12,
            border: "1px solid rgba(148, 163, 184, 0.35)",
            background: "rgba(255, 255, 255, 0.98)",
            color: "#0b1020",
            padding: 12,
            fontFamily: "DM Mono, monospace",
            fontSize: 13
          }}
        />
      </section>

      {result?.assets?.length ? (
        <section
          style={{
            marginTop: 16,
            border: "1px solid var(--line)",
            borderRadius: 16,
            background: "rgba(10, 18, 38, 0.9)",
            padding: 16
          }}
        >
          <h2 style={{ margin: 0, fontSize: 20 }}>Uploaded Assets ({result.assets.length})</h2>
          <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
            {result.assets.map((asset) => (
              <a
                key={asset.key}
                href={asset.url}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "block",
                  border: "1px solid rgba(148, 163, 184, 0.25)",
                  borderRadius: 10,
                  padding: "8px 10px",
                  color: "var(--ink-1)"
                }}
              >
                <div style={{ fontWeight: 600 }}>{asset.filename}</div>
                <div style={{ fontSize: 12, color: "var(--ink-2)", wordBreak: "break-all" }}>{asset.key}</div>
              </a>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
