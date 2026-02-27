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
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (idParam) {
      setLoading(true);
      setError(null);
      void loadDraft(idParam)
        .then((draft) => setContent(draft.markdown))
        .catch(() => {
          setContent("");
          setError("ไม่พบงานที่แชร์ หรือไม่มีสิทธิ์เข้าถึง");
        })
        .finally(() => setLoading(false));
      return;
    }

    const decompressed = decompressFromEncodedURIComponent(docParam || "");
    if (decompressed) {
      setContent(decompressed);
      return;
    }
    const decoded = decodeBase64Url(docParam);
    setContent(decoded);
    if (!decoded) setError("ไม่พบเนื้อหา");
  }, [docParam, idParam]);

  const html = useMemo(() => {
    if (!content) return "";
    const raw = marked.parse(content);
    return DOMPurify.sanitize(String(raw));
  }, [content]);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 pb-12 pt-6 sm:px-6">
      <section className="rounded-3xl border border-slate-300 bg-white p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Markdown Viewer</h1>
            <p className="mt-2 text-sm text-slate-600">ลิงก์นี้แสดง Markdown แบบอ่านอย่างเดียว</p>
          </div>
          <a className="button" href="/tools/markdown">
            กลับไปแก้ไข
          </a>
        </div>
      </section>

      <section
        className="viewer-content mt-4 rounded-3xl border border-slate-300 bg-white p-6 leading-7 text-slate-900 sm:p-8"
        dangerouslySetInnerHTML={{
          __html: loading
            ? "<p>กำลังโหลด…</p>"
            : error
              ? `<p>${error}</p>`
              : html || "<p>ไม่พบเนื้อหา</p>"
        }}
      />
    </main>
  );
}

