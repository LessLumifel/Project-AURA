import React from "react";
import { styles } from "../styles";
import type { DraftMeta } from "../drafts";

type Props = {
  drafts: DraftMeta[];
  currentId: string | null;
  onSelect: (id: string) => void;
  onSave: () => void;
  onDelete: () => void;
  draftTitle: string;
  onTitleChange: (value: string) => void;
  autosave: boolean;
  onToggleAutosave: () => void;
};

export default function SavePanel({
  drafts,
  currentId,
  onSelect,
  onSave,
  onDelete,
  draftTitle,
  onTitleChange,
  autosave,
  onToggleAutosave
}: Props): React.ReactElement {
  return (
    <div style={styles.controlsSection}>
      <div style={styles.labelSection}>
        <label style={styles.label}>ชื่อชุดงาน</label>
        <input
          value={draftTitle}
          onChange={(e) => onTitleChange(e.target.value)}
          style={styles.input}
          placeholder="เช่น คู่มือการตลาด Q1"
        />
      </div>

      <div style={styles.labelSection}>
        <label style={styles.label}>โหลดงาน</label>
        <select
          value={currentId ?? ""}
          onChange={(e) => {
            const value = e.target.value;
            onSelect(value);
            if (value === "__new__") e.currentTarget.value = "";
          }}
          style={{
            ...styles.input,
            minWidth: 220,
            cursor: "pointer"
          }}
        >
          <option value="__new__">+ สร้างงานใหม่</option>
          <option value="" disabled>
            เลือกงานที่บันทึกไว้
          </option>
          {drafts.map((draft) => (
            <option key={draft.id} value={draft.id}>
              {draft.title || "(ไม่มีชื่อ)"} • {new Date(draft.updatedAt).toLocaleString()}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={onSave}
        style={{
          ...styles.button,
          ...styles.buttonPrimary
        }}
      >
        บันทึก
      </button>

      <button
        onClick={onDelete}
        style={{
          ...styles.button,
          ...styles.buttonSecondary
        }}
      >
        ลบงาน
      </button>

      <button
        onClick={onToggleAutosave}
        style={{
          ...styles.button,
          ...(autosave ? styles.buttonPrimary : styles.buttonSecondary)
        }}
      >
        {autosave ? "Auto-save: On" : "Auto-save: Off"}
      </button>
    </div>
  );
}
