import React from "react";
import { styles } from "../styles";

type Props = {
  filename: string;
  onFilenameChange: (value: string) => void;
  onExport: () => void;
  onShare: () => void;
  onImport: (file: File) => void;
  imageCount: number;
  hoveredButton: string | null;
  setHoveredButton: (value: string | null) => void;
  fileHovered: boolean;
  setFileHovered: (value: boolean) => void;
};

export default function ControlsBar({
  filename,
  onFilenameChange,
  onExport,
  onShare,
  onImport,
  imageCount,
  hoveredButton,
  setHoveredButton,
  fileHovered,
  setFileHovered
}: Props): React.ReactElement {
  return (
    <div style={styles.controlsSection}>
      <div style={styles.labelSection}>
        <label style={styles.label}>ชื่อไฟล์</label>
        <input
          value={filename}
          onChange={(e) => onFilenameChange(e.target.value)}
          onFocus={(e) => {
            (e.target as HTMLInputElement).style.borderColor = styles.inputFocus.borderColor;
            (e.target as HTMLInputElement).style.boxShadow = styles.inputFocus.boxShadow;
          }}
          onBlur={(e) => {
            (e.target as HTMLInputElement).style.borderColor = "var(--line)";
            (e.target as HTMLInputElement).style.boxShadow = "none";
          }}
          style={styles.input}
          placeholder="new-doc.md"
        />
      </div>

      <button
        onClick={onExport}
        onMouseEnter={() => setHoveredButton("export")}
        onMouseLeave={() => setHoveredButton(null)}
        style={{
          ...styles.button,
          ...styles.buttonPrimary,
          ...(hoveredButton === "export" ? styles.buttonPrimaryHover : {})
        }}
      >
        Export ZIP
      </button>

      <button
        onClick={onShare}
        onMouseEnter={() => setHoveredButton("share")}
        onMouseLeave={() => setHoveredButton(null)}
        style={{
          ...styles.button,
          ...styles.buttonSecondary,
          ...(hoveredButton === "share" ? styles.buttonSecondaryHover : {})
        }}
      >
        Share Link
      </button>

      <label
        onMouseEnter={() => setFileHovered(true)}
        onMouseLeave={() => setFileHovered(false)}
        style={{
          ...styles.fileInputLabel,
          ...(fileHovered ? styles.fileInputLabelHover : {})
        }}
      >
        Import MD/MDX
        <input
          type="file"
          accept=".md,.mdx,text/markdown"
          style={{ display: "none" }}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onImport(f);
            e.currentTarget.value = "";
          }}
        />
      </label>

      <div style={styles.badge}>ภาพ {imageCount} รายการ</div>
    </div>
  );
}
