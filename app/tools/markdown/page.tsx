"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import JSZip from "jszip";
import TopLinks from "./components/TopLinks";
import HeaderSection from "./components/HeaderSection";
import ControlsBar from "./components/ControlsBar";
import EditorPane from "./components/EditorPane";
import type { MDXEditorMethods } from "@mdxeditor/editor";
import SavePanel from "./components/SavePanel";
import { styles } from "./styles";
import {
  buildUploadImageName,
  ImageAsset,
  ensureExt,
  fileToDataUrl,
  slugifyFilename,
  toDocsPath
} from "./utils";
import { DraftMeta, fetchDrafts, loadDraft, removeDraft, saveDraft } from "./drafts";

function calculateEditorStats(markdown: string): { words: number; chars: number } {
  const text = markdown.replace(/```[\s\S]*?```/g, " ").replace(/[#>*`~\-\[\]()]/g, " ");
  const words = text
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  return { words, chars: markdown.length };
}

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
  const autosaveDebounceRef = useRef<number | null>(null);
  const statsDebounceRef = useRef<number | null>(null);
  const [editorKey, setEditorKey] = useState(1);
  const [filename, setFilename] = useState("new-doc.md");
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [fileHovered, setFileHovered] = useState(false);
  const [shareStatus, setShareStatus] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<DraftMeta[]>([]);
  const [draftTitle, setDraftTitle] = useState("งานใหม่");
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);
  const [autosave, setAutosave] = useState(true);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [autosaveSignal, setAutosaveSignal] = useState(0);
  const [editorStats, setEditorStats] = useState(() => calculateEditorStats(initialMarkdown));
  const [textColor, setTextColor] = useState("#2563eb");
  const pasteInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<MDXEditorMethods | null>(null);
  const contextSelectionRef = useRef<Range | null>(null);
  const lastSelectionRef = useRef<Range | null>(null);
  const [contextTools, setContextTools] = useState<{ x: number; y: number; visible: boolean }>({
    x: 0,
    y: 0,
    visible: false
  });

  useEffect(() => {
    fetchDrafts()
      .then((items) => setDrafts(items))
      .catch(() => setDrafts([]));
    return () => {
      if (autosaveDebounceRef.current) {
        window.clearTimeout(autosaveDebounceRef.current);
      }
      if (statsDebounceRef.current) {
        window.clearTimeout(statsDebounceRef.current);
      }
      for (const asset of imagesRef.current.values()) {
        URL.revokeObjectURL(asset.previewUrl);
      }
      imagesRef.current.clear();
      previewToFinalRef.current.clear();
    };
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const moveTooltipsToBody = () => {
      const roots = Array.from(document.querySelectorAll("[data-tippy-root]"));
      roots.forEach((root) => {
        if (root.parentElement !== document.body) {
          document.body.appendChild(root);
        }
      });
    };

    moveTooltipsToBody();
    const observer = new MutationObserver(() => moveTooltipsToBody());
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  const queueEditorWork = useCallback((value: string) => {
    if (statsDebounceRef.current) window.clearTimeout(statsDebounceRef.current);
    statsDebounceRef.current = window.setTimeout(() => {
      setEditorStats(calculateEditorStats(value));
    }, 180);

    if (autosaveDebounceRef.current) window.clearTimeout(autosaveDebounceRef.current);
    autosaveDebounceRef.current = window.setTimeout(() => {
      setAutosaveSignal((prev) => prev + 1);
    }, 700);
  }, []);

  useEffect(() => {
    if (!autosave) return;
    if (!currentDraftId) return;
    if (!isDirty) return;

    setSaveStatus("กำลังบันทึกอัตโนมัติ...");
    void saveDraft({
      id: currentDraftId,
      title: draftTitle,
      filename,
      markdown: markdownRef.current
    })
      .then((meta) => {
        setDrafts((prev) => [meta, ...prev.filter((item) => item.id !== meta.id)]);
        setSaveStatus("บันทึกอัตโนมัติแล้ว");
        setIsDirty(false);
      })
      .catch(() => setSaveStatus("บันทึกอัตโนมัติล้มเหลว"));
  }, [autosave, autosaveSignal, currentDraftId, draftTitle, filename, isDirty]);

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
    setShareStatus("กำลังบันทึกก่อนแชร์...");
    setShareUrl(null);
    let md = markdownRef.current || "";

    for (const asset of imagesRef.current.values()) {
      if (asset.file && !asset.uploaded) {
        const dataUrl = await fileToDataUrl(asset.file);
        md = md.split(asset.previewUrl).join(dataUrl);
        md = md.split(asset.finalSrc).join(dataUrl);
      } else {
        md = md.split(asset.previewUrl).join(asset.finalSrc);
      }
    }

    try {
      const meta = await saveDraft({
        id: currentDraftId ?? undefined,
        title: draftTitle,
        filename,
        markdown: md
      });
      setCurrentDraftId(meta.id);
      setDrafts((prev) => [meta, ...prev.filter((item) => item.id !== meta.id)]);

      const url = `${origin}/tools/markdown/viewer?id=${meta.id}`;
      setShareUrl(url);
      try {
        await navigator.clipboard.writeText(url);
        setShareStatus("บันทึกแล้วและคัดลอกลิงก์แชร์เรียบร้อย");
        setIsDirty(false);
      } catch {
        setShareStatus("ไม่สามารถคัดลอกลิงก์อัตโนมัติได้");
      }
    } catch {
      setShareStatus("บันทึกไม่สำเร็จ จึงยังไม่สร้างลิงก์แชร์");
    }
  }, [currentDraftId, draftTitle, filename]);

  const onImport = useCallback(
    async (file: File) => {
      const text = await file.text();
      setInitialMarkdown(text);
      markdownRef.current = text;
      setEditorStats(calculateEditorStats(text));
      setIsDirty(true);
      queueEditorWork(text);

      setFilename(file.name.endsWith(".md") || file.name.endsWith(".mdx") ? file.name : "imported.md");

      for (const asset of imagesRef.current.values()) {
        URL.revokeObjectURL(asset.previewUrl);
      }
      imagesRef.current.clear();
      previewToFinalRef.current.clear();

      setEditorKey((k) => k + 1);
    },
    [queueEditorWork]
  );

  const handleSave = useCallback(() => {
    void saveDraft({
      id: currentDraftId ?? undefined,
      title: draftTitle,
      filename,
      markdown: markdownRef.current
    })
      .then((meta) => {
        setDrafts((prev) => [meta, ...prev.filter((item) => item.id !== meta.id)]);
        setCurrentDraftId(meta.id);
        setSaveStatus("บันทึกงานแล้ว");
        setIsDirty(false);
      })
      .catch(() => setSaveStatus("บันทึกงานล้มเหลว"));
  }, [currentDraftId, draftTitle, filename]);

  const handleSelectDraft = useCallback((id: string) => {
    if (id === "__new__") {
      window.location.reload();
      return;
    }
    void loadDraft(id)
      .then((draft) => {
        setCurrentDraftId(draft.id);
        setDraftTitle(draft.title || "งานใหม่");
        setFilename(draft.filename || "new-doc.md");
        setInitialMarkdown(draft.markdown);
        markdownRef.current = draft.markdown;
        setEditorStats(calculateEditorStats(draft.markdown));
        setIsDirty(false);

        for (const asset of imagesRef.current.values()) {
          URL.revokeObjectURL(asset.previewUrl);
        }
        imagesRef.current.clear();
        previewToFinalRef.current.clear();

        setEditorKey((k) => k + 1);
        setSaveStatus("โหลดงานแล้ว");
      })
      .catch(() => setSaveStatus("โหลดงานล้มเหลว"));
  }, []);

  const handleDeleteDraft = useCallback(() => {
    if (!currentDraftId) return;
    void removeDraft(currentDraftId)
      .then(() => {
        setDrafts((prev) => prev.filter((item) => item.id !== currentDraftId));
        setCurrentDraftId(null);
        setDraftTitle("งานใหม่");
        setSaveStatus("ลบงานแล้ว");
      })
      .catch(() => setSaveStatus("ลบงานล้มเหลว"));
  }, [currentDraftId]);

  const uploadAndEmbed = useCallback(
    async (file: File) => {
      if (!file) return "";
      const uploadName = buildUploadImageName(file.name || "image.png", filename);
      const safe = uploadName;
      const previewUrl = URL.createObjectURL(file);

      const prev = imagesRef.current.get(safe);
      if (prev) {
        URL.revokeObjectURL(prev.previewUrl);
        previewToFinalRef.current.delete(prev.previewUrl);
      }

      const uploadUrl = uploadApiUrl || `${window.location.origin}/api/upload`;
      const form = new FormData();
      const uploadFile = new File([file], uploadName, {
        type: file.type || "application/octet-stream",
        lastModified: file.lastModified
      });
      form.append("file", uploadFile);
      form.append("filename", uploadName);

      try {
        const res = await fetch(uploadUrl, { method: "POST", body: form });
        if (!res.ok) throw new Error("upload failed");
        const json = (await res.json()) as { url: string };
        const finalSrc = json.url;
        imagesRef.current.set(safe, { file, previewUrl, finalSrc, uploaded: true });
        previewToFinalRef.current.set(previewUrl, finalSrc);
        return finalSrc;
      } catch {
        imagesRef.current.set(safe, { file, previewUrl, finalSrc: previewUrl, uploaded: false });
        previewToFinalRef.current.set(previewUrl, previewUrl);
        return previewUrl;
      }
    },
    [filename, uploadApiUrl]
  );

  const insertImageAtCursor = useCallback(
    async (file: File) => {
      const url = await uploadAndEmbed(file);
      if (!url) return;
      const markdown = `\n\n![](${url})\n`;
      if (editorRef.current?.insertMarkdown) {
        editorRef.current.focus?.(
          () => {
            editorRef.current?.insertMarkdown(markdown);
          },
          { preventScroll: true }
        );
      } else {
        markdownRef.current += markdown;
        setInitialMarkdown(markdownRef.current);
        setEditorStats(calculateEditorStats(markdownRef.current));
        queueEditorWork(markdownRef.current);
        setEditorKey((k) => k + 1);
      }
      setIsDirty(true);
    },
    [queueEditorWork, uploadAndEmbed]
  );

  const restoreContextSelection = useCallback(() => {
    const range = contextSelectionRef.current;
    if (!range) return;
    const selection = window.getSelection();
    if (!selection) return;
    selection.removeAllRanges();
    selection.addRange(range);
  }, []);

  const handlePasteFiles = useCallback(
    async (files: File[]) => {
      for (const file of files) {
        if (!file.type.startsWith("image/")) continue;
        await insertImageAtCursor(file);
      }
      setIsDirty(true);
    },
    [insertImageAtCursor]
  );

  const replacePendingPlaceholder = useCallback(
    async (file: File) => {
      await insertImageAtCursor(file);
    },
    [insertImageAtCursor]
  );

  const colorSelectedTextFromContext = useCallback(() => {
    if (!contextSelectionRef.current && lastSelectionRef.current) {
      contextSelectionRef.current = lastSelectionRef.current;
    }
    const selectedText = contextSelectionRef.current?.toString() ?? "";
    if (!selectedText.trim()) {
      setShareStatus("กรุณาเลือกข้อความก่อนเปลี่ยนสี");
      return;
    }

    const snippet = `<span style="color: ${textColor};">${selectedText}</span>`;
    if (editorRef.current?.insertMarkdown) {
      editorRef.current.focus(
        () => {
          restoreContextSelection();
          editorRef.current?.insertMarkdown(snippet);
          setIsDirty(true);
          setContextTools((prev) => ({ ...prev, visible: false }));
        },
        { preventScroll: true }
      );
      return;
    }

    setShareStatus("ไม่สามารถเปลี่ยนสีข้อความได้");
  }, [restoreContextSelection, textColor]);

  return (
    <div style={styles.page} className="markdown-page">
      <div
        style={styles.container}
        onClick={() => setContextTools((prev) => ({ ...prev, visible: false }))}
      >
        <TopLinks />
        <HeaderSection />
        <section
          style={{
            ...styles.controlsSection,
            padding: "12px 14px",
            justifyContent: "space-between"
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, minWidth: 260 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700
              }}
            >
              {draftTitle || "งานใหม่"}
            </div>
            <div style={styles.helper}>
              พื้นที่เขียนแบบโฟกัส ใช้งานเร็ว
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <div style={styles.badge}>คำ {editorStats.words.toLocaleString()}</div>
            <div style={styles.badge}>ตัวอักษร {editorStats.chars.toLocaleString()}</div>
            <div style={styles.badge}>รูป {imagesRef.current.size}</div>
            <div style={styles.badge}>{autosave ? "Auto-save On" : "Auto-save Off"}</div>
          </div>
        </section>

        <SavePanel
          drafts={drafts}
          currentId={currentDraftId}
          onSelect={handleSelectDraft}
          onSave={handleSave}
          onDelete={() => {
            if (!currentDraftId) return;
            const confirmed = window.confirm("ยืนยันการลบงานนี้ถาวร?");
            if (confirmed) handleDeleteDraft();
          }}
          draftTitle={draftTitle}
          onTitleChange={setDraftTitle}
          autosave={autosave}
          onToggleAutosave={() => setAutosave((prev) => !prev)}
        />

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

        {(shareStatus || saveStatus) && (
          <div style={{ ...styles.controlsSection, ...styles.helperSuccess, padding: "8px 12px" }}>
            {[shareStatus, saveStatus].filter(Boolean).join(" • ")}
          </div>
        )}

        <div id="mdx-toolbar-host" className="mdx-toolbar-host" />

        {shareUrl && (
          <div style={{ ...styles.controlsSection, padding: "12px 16px" }}>
            <div style={{ ...styles.labelSection, flex: 2 }}>
              <label style={styles.label}>ลิงก์แชร์</label>
              <input value={shareUrl} readOnly style={styles.input} />
            </div>
            <a className="button primary" href={shareUrl} target="_blank" rel="noreferrer">
              เปิดลิงก์
            </a>
          </div>
        )}

        <EditorPane
          editorKey={editorKey}
          markdown={initialMarkdown}
          onChange={(value) => {
            markdownRef.current = value;
            queueEditorWork(value);
            setIsDirty(true);
          }}
          onImagePicked={(file) => uploadAndEmbed(file)}
          onPasteFiles={handlePasteFiles}
          onContextUpload={() => pasteInputRef.current?.click()}
          onShowContextTools={(x, y, range) => {
            contextSelectionRef.current = range ?? lastSelectionRef.current;
            setContextTools({ x, y, visible: true });
          }}
          onSelectionChange={(range) => {
            lastSelectionRef.current = range;
          }}
          onEditorReady={(methods) => {
            editorRef.current = methods;
          }}
        />
        <input
          ref={pasteInputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              restoreContextSelection();
              void replacePendingPlaceholder(file);
            }
            event.currentTarget.value = "";
          }}
        />
        {contextTools.visible && (
          <div
            className="context-tools"
            style={{ left: contextTools.x, top: contextTools.y }}
            onClick={(event) => event.stopPropagation()}
          >
            <input
              type="color"
              value={textColor}
              onChange={(event) => setTextColor(event.target.value)}
              style={{ width: 36, height: 32, border: "none", background: "transparent", cursor: "pointer" }}
              aria-label="เลือกสีข้อความ"
            />
            <button
              className="button primary"
              onMouseDown={(event) => event.preventDefault()}
              onClick={colorSelectedTextFromContext}
            >
              เปลี่ยนสีข้อความ
            </button>
            <button
              className="button primary"
              onClick={() => {
                setContextTools((prev) => ({ ...prev, visible: false }));
                pasteInputRef.current?.click();
              }}
            >
              เพิ่มรูป
            </button>
            <button
              className="button"
              onClick={() => setContextTools((prev) => ({ ...prev, visible: false }))}
            >
              ปิด
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
