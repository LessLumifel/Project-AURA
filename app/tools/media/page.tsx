"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

type MediaItem = {
  id: string;
  source?: "media" | "draft";
  draftId?: string;
  key: string;
  url: string;
  filename: string;
  displayName: string;
  contentType: string;
  size: number;
  createdAt: string;
  updatedAt: string;
  tags: string[];
};

type MediaListResponse = {
  items: MediaItem[];
  total: number;
  hasMore: boolean;
  nextOffset: number | null;
};

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const idx = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, idx);
  return `${value.toFixed(value >= 10 || idx === 0 ? 0 : 1)} ${units[idx]}`;
}

function isImage(contentType: string) {
  return contentType.startsWith("image/");
}

function isPdf(contentType: string, filename: string) {
  return contentType === "application/pdf" || filename.toLowerCase().endsWith(".pdf");
}

function isTextLike(contentType: string, filename: string) {
  const lower = filename.toLowerCase();
  if (contentType.startsWith("text/")) return true;
  return lower.endsWith(".md") || lower.endsWith(".txt") || lower.endsWith(".json") || lower.endsWith(".csv");
}

function toTagText(tags: string[]) {
  return tags.join(", ");
}

function parseTagText(raw: string) {
  return raw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

export default function MediaManagerPage(): React.ReactElement {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "image" | "document">("all");
  const [sourceFilter, setSourceFilter] = useState<"all" | "media" | "draft">("all");
  const [status, setStatus] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [nextOffset, setNextOffset] = useState<number | null>(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editTags, setEditTags] = useState("");
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedQuery(query.trim()), 250);
    return () => window.clearTimeout(id);
  }, [query]);

  const fetchItems = useCallback(async (options?: { append?: boolean; offset?: number }) => {
    const append = options?.append || false;
    const offset = options?.offset || 0;
    const params = new URLSearchParams();
    params.set("limit", "30");
    params.set("offset", String(offset));
    if (debouncedQuery) params.set("q", debouncedQuery);
    if (typeFilter !== "all") params.set("type", typeFilter);
    if (sourceFilter !== "all") params.set("source", sourceFilter);

    setLoading(true);
    try {
      const res = await fetch(`/api/media?${params.toString()}`, { cache: "no-store" });
      if (!res.ok) throw new Error("load failed");
      const data = (await res.json()) as MediaListResponse;
      setItems((prev) => (append ? [...prev, ...(data.items || [])] : data.items || []));
      setTotal(Number(data.total || 0));
      setNextOffset(data.hasMore ? Number(data.nextOffset || 0) : null);
      if (!append) {
        const first = data.items?.[0];
        setSelectedId(first?.id || null);
      }
    } catch {
      setStatus("โหลดรายการไฟล์ไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, sourceFilter, typeFilter]);

  useEffect(() => {
    void fetchItems({ append: false, offset: 0 });
  }, [fetchItems]);

  const selected = useMemo(() => items.find((item) => item.id === selectedId) || null, [items, selectedId]);

  useEffect(() => {
    if (!selected) {
      setEditName("");
      setEditTags("");
      return;
    }
    setEditName(selected.displayName);
    setEditTags(toTagText(selected.tags || []));
  }, [selected]);

  const onUpload = useCallback(async (file: File) => {
    setStatus("กำลังอัปโหลด...");
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: form });
      if (!res.ok) throw new Error("upload failed");
      setStatus(`อัปโหลดแล้ว: ${file.name}`);
      await fetchItems({ append: false, offset: 0 });
    } catch {
      setStatus("อัปโหลดล้มเหลว");
    }
  }, [fetchItems]);

  const onSaveSelected = useCallback(async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const nextTags = parseTagText(editTags);
      const endpoint = selected.source === "draft" ? `/api/drafts/${selected.draftId || selected.id.replace(/^draft:/, "")}` : `/api/media/${selected.id}`;
      const payload =
        selected.source === "draft"
          ? { title: editName.trim(), filename: selected.filename }
          : { displayName: editName.trim(), tags: nextTags };
      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("save failed");

      setItems((prev) =>
        prev.map((item) =>
          item.id === selected.id
            ? {
                ...item,
                displayName: editName.trim() || item.displayName,
                tags: selected.source === "draft" ? item.tags : nextTags,
                updatedAt: new Date().toISOString()
              }
            : item
        )
      );
      setStatus("อัปเดตรายละเอียดแล้ว");
    } catch {
      setStatus("อัปเดตรายละเอียดไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  }, [editName, editTags, selected]);

  const onDeleteSelected = useCallback(async () => {
    if (!selected) return;
    const confirmed = window.confirm(`ยืนยันการลบไฟล์ ${selected.displayName} ถาวร?`);
    if (!confirmed) return;
    try {
      const endpoint = selected.source === "draft" ? `/api/drafts/${selected.draftId || selected.id.replace(/^draft:/, "")}` : `/api/media/${selected.id}`;
      const res = await fetch(endpoint, { method: "DELETE" });
      if (!res.ok) throw new Error("delete failed");
      const next = items.filter((item) => item.id !== selected.id);
      setItems(next);
      setSelectedId(next[0]?.id || null);
      setTotal((prev) => Math.max(prev - 1, 0));
      setStatus("ลบไฟล์เรียบร้อย");
    } catch {
      setStatus("ลบไฟล์ไม่สำเร็จ");
    }
  }, [items, selected]);

  const onSync = useCallback(async () => {
    setSyncing(true);
    setStatus("กำลัง sync ไฟล์เก่าจาก server...");
    try {
      const res = await fetch("/api/media/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prefix: "uploads/", maxScan: 5000 })
      });
      if (!res.ok) throw new Error("sync failed");
      const data = (await res.json()) as { scanned: number; inserted: number };
      setStatus(`sync สำเร็จ: scan ${data.scanned} | เพิ่ม ${data.inserted}`);
      await fetchItems({ append: false, offset: 0 });
    } catch {
      setStatus("sync ล้มเหลว");
    } finally {
      setSyncing(false);
    }
  }, [fetchItems]);

  const onCopyUrl = useCallback(async () => {
    if (!selected) return;
    const targetUrl = selected.source === "draft" ? `${window.location.origin}/tools/markdown/viewer?id=${selected.draftId || selected.id.replace(/^draft:/, "")}` : selected.url;
    try {
      await navigator.clipboard.writeText(targetUrl);
      setStatus("คัดลอก URL แล้ว");
    } catch {
      setStatus("คัดลอก URL ไม่สำเร็จ");
    }
  }, [selected]);

  const totalSize = useMemo(() => items.reduce((acc, item) => acc + item.size, 0), [items]);

  return (
    <main style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 20px 32px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 30 }}>Media Manager</h1>
          <p style={{ margin: "8px 0 0", color: "var(--ink-2)" }}>หน้าเดียวสำหรับดู แก้ชื่อ/แท็ก และลบไฟล์ แบบเร็วและเบา server</p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <a className="button" href="/">กลับหน้าแรก</a>
          <a className="button" href="/tools/markdown">ไป Markdown Studio</a>
        </div>
      </div>

      <section style={{ marginTop: 14, padding: 14, borderRadius: 14, border: "1px solid var(--line)", background: "rgba(12, 20, 44, 0.65)" }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ค้นหาจากชื่อไฟล์, key, tag"
            style={{ flex: 1, minWidth: 240, height: 38, borderRadius: 9, border: "1px solid #4f6088", padding: "0 10px" }}
          />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as "all" | "image" | "document")}
            style={{ height: 38, borderRadius: 9, border: "1px solid #4f6088", padding: "0 10px" }}
          >
            <option value="all">ทั้งหมด</option>
            <option value="image">เฉพาะรูป</option>
            <option value="document">เฉพาะเอกสาร</option>
          </select>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value as "all" | "media" | "draft")}
            style={{ height: 38, borderRadius: 9, border: "1px solid #4f6088", padding: "0 10px" }}
          >
            <option value="all">ทุกแหล่ง</option>
            <option value="media">media</option>
            <option value="draft">drafts</option>
          </select>
          <label className="button" style={{ cursor: "pointer" }}>
            อัปโหลด
            <input
              type="file"
              hidden
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  void onUpload(file);
                  event.target.value = "";
                }
              }}
            />
          </label>
          <button className="button" disabled={syncing} onClick={() => void onSync()}>
            {syncing ? "กำลัง Sync..." : "Sync ไฟล์เก่า"}
          </button>
          <button className="button" onClick={() => void fetchItems({ append: false, offset: 0 })}>Refresh</button>
        </div>
        <div style={{ marginTop: 8, fontSize: 13, color: "var(--ink-2)" }}>
          แสดง {items.length} / {total} รายการ | ขนาดในหน้าปัจจุบัน {formatBytes(totalSize)}
        </div>
        {status ? <div style={{ marginTop: 8, color: "var(--ice-1)", fontSize: 14 }}>{status}</div> : null}
      </section>

      <section style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 12 }}>
        <div style={{ border: "1px solid var(--line)", borderRadius: 14, background: "rgba(10, 18, 38, 0.9)", overflow: "hidden" }}>
          <div style={{ padding: "10px 12px", borderBottom: "1px solid var(--line)", fontWeight: 600 }}>รายการไฟล์</div>
          <div style={{ maxHeight: "68vh", overflow: "auto" }}>
            {!loading && items.length === 0 ? (
              <div style={{ padding: 14, color: "var(--ink-2)" }}>ไม่พบรายการ</div>
            ) : null}
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedId(item.id)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  border: "none",
                  borderBottom: "1px solid rgba(78, 96, 136, 0.35)",
                  background: selectedId === item.id ? "rgba(106, 215, 255, 0.16)" : "transparent",
                  padding: "10px 12px",
                  cursor: "pointer"
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink-0)" }}>{item.displayName}</div>
                <div style={{ fontSize: 12, color: "var(--ink-2)", marginTop: 3 }}>{item.filename}</div>
                <div style={{ fontSize: 12, color: "var(--ink-2)", marginTop: 2 }}>
                  {item.contentType} | {formatBytes(item.size)}
                </div>
                <div style={{ fontSize: 11, color: "var(--ice-2)", marginTop: 2 }}>
                  source: {item.source || "media"}
                </div>
              </button>
            ))}
            {loading ? <div style={{ padding: 12, color: "var(--ink-2)" }}>กำลังโหลด...</div> : null}
            {!loading && nextOffset !== null ? (
              <div style={{ padding: 10 }}>
                <button className="button" style={{ width: "100%" }} onClick={() => void fetchItems({ append: true, offset: nextOffset })}>
                  โหลดเพิ่ม
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <div style={{ border: "1px solid var(--line)", borderRadius: 14, background: "rgba(10, 18, 38, 0.9)", padding: 12 }}>
          {!selected ? (
            <div style={{ color: "var(--ink-2)" }}>เลือกรายการจากฝั่งซ้ายเพื่อดูรายละเอียด</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ borderRadius: 10, overflow: "hidden", background: "rgba(4, 10, 24, 0.9)", minHeight: 210, display: "grid", placeItems: "center" }}>
                {isImage(selected.contentType) ? (
                  <img src={selected.url} alt={selected.displayName} style={{ width: "100%", maxHeight: 320, objectFit: "contain" }} />
                ) : selected.source === "draft" ? (
                  <iframe
                    src={selected.url}
                    title={selected.displayName}
                    style={{ width: "100%", height: 360, border: "none", background: "#0b1226" }}
                  />
                ) : isPdf(selected.contentType, selected.filename) ? (
                  <iframe
                    src={selected.url}
                    title={selected.displayName}
                    style={{ width: "100%", height: 360, border: "none", background: "#0b1226" }}
                  />
                ) : isTextLike(selected.contentType, selected.filename) ? (
                  <iframe
                    src={selected.url}
                    title={selected.displayName}
                    style={{ width: "100%", height: 320, border: "none", background: "#0b1226" }}
                  />
                ) : (
                  <div style={{ fontSize: 13, color: "var(--ink-2)", padding: 12, textAlign: "center" }}>
                    Preview not available
                    <div style={{ marginTop: 8 }}>
                      ใช้ปุ่ม Open/Download เพื่อเปิดเอกสาร
                    </div>
                  </div>
                )}
              </div>

              <form
                onSubmit={(event: FormEvent) => {
                  event.preventDefault();
                  void onSaveSelected();
                }}
                style={{ display: "flex", flexDirection: "column", gap: 8 }}
              >
                <label style={{ fontSize: 12, color: "var(--ink-2)" }}>Display Name</label>
                <input
                  value={editName}
                  onChange={(event) => setEditName(event.target.value)}
                  style={{ height: 38, borderRadius: 8, border: "1px solid #4f6088", padding: "0 10px" }}
                />

                <label style={{ fontSize: 12, color: "var(--ink-2)" }}>Tags (comma separated)</label>
                <input
                  value={editTags}
                  onChange={(event) => setEditTags(event.target.value)}
                  style={{ height: 38, borderRadius: 8, border: "1px solid #4f6088", padding: "0 10px" }}
                />

                <div style={{ fontSize: 12, color: "var(--ink-2)", wordBreak: "break-all" }}>{selected.key}</div>
                <div style={{ fontSize: 12, color: "var(--ink-2)" }}>
                  {selected.contentType} | {formatBytes(selected.size)} | updated {new Date(selected.updatedAt).toLocaleString()}
                </div>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button className="button primary" type="submit" disabled={saving}>
                    {saving ? "กำลังบันทึก..." : "บันทึกรายละเอียด"}
                  </button>
                  <button type="button" className="button" onClick={() => void onCopyUrl()}>
                    Copy URL
                  </button>
                  <a className="button" href={selected.url} target="_blank" rel="noreferrer">
                    {selected.source === "draft" ? "View Draft" : "View"}
                  </a>
                  <a
                    className="button"
                    href={
                      selected.source === "draft"
                        ? `/api/drafts/${selected.draftId || selected.id.replace(/^draft:/, "")}`
                        : selected.url
                    }
                    target="_blank"
                    rel="noreferrer"
                    download={selected.source === "draft" ? undefined : selected.filename}
                  >
                    {selected.source === "draft" ? "Open Draft JSON" : "Open/Download"}
                  </a>
                  <button type="button" className="button" onClick={() => void onDeleteSelected()}>
                    Delete
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
