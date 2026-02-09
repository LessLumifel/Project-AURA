export type Draft = {
  id: string;
  title: string;
  filename: string;
  markdown: string;
  updatedAt: string;
};

export type DraftMeta = Omit<Draft, "markdown">;

export async function fetchDrafts(): Promise<DraftMeta[]> {
  const res = await fetch("/api/drafts", { cache: "no-store" });
  if (!res.ok) throw new Error("โหลดรายการงานไม่สำเร็จ");
  return (await res.json()) as DraftMeta[];
}

export async function saveDraft(payload: Partial<Draft>): Promise<DraftMeta> {
  const res = await fetch("/api/drafts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!res.ok) throw new Error("บันทึกงานไม่สำเร็จ");
  return (await res.json()) as DraftMeta;
}

export async function loadDraft(id: string): Promise<Draft> {
  const res = await fetch(`/api/drafts/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("โหลดงานไม่สำเร็จ");
  return (await res.json()) as Draft;
}

export async function removeDraft(id: string): Promise<void> {
  const res = await fetch(`/api/drafts/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("ลบงานไม่สำเร็จ");
}
