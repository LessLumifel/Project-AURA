export const styles = {
  page: {
    minHeight: "100vh",
    width: "100%",
    background: "transparent"
  },
  container: {
    padding: "24px 20px 30px 20px",
    maxWidth: "1120px",
    margin: "0 auto",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column" as const,
    gap: "12px",
    fontFamily: "'Space Grotesk', system-ui, sans-serif"
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    flexWrap: "wrap" as const
  },
  title: {
    fontSize: "28px",
    fontWeight: 700,
    margin: 0,
    color: "#0f172a"
  },
  subtitle: {
    fontSize: "14px",
    color: "#475569",
    margin: "4px 0 0 0"
  },
  controlsSection: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    flexWrap: "wrap" as const,
    padding: "14px 16px",
    backgroundColor: "var(--panel)",
    borderRadius: "14px",
    border: "1px solid var(--line)",
    boxShadow: "0 4px 12px rgba(15, 23, 42, 0.06)"
  },
  labelSection: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    flex: 1,
    minWidth: "240px"
  },
  label: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#334155",
    whiteSpace: "nowrap" as const
  },
  input: {
    padding: "9px 11px",
    fontSize: "14px",
    border: "1px solid var(--line)",
    borderRadius: "9px",
    fontFamily: "inherit",
    transition: "all 0.2s ease",
    flex: 1,
    minWidth: "200px",
    backgroundColor: "#ffffff",
    color: "#1e293b"
  } as React.CSSProperties,
  inputFocus: {
    outline: "none",
    borderColor: "#94a3b8",
    boxShadow: "0 0 0 3px rgba(148, 163, 184, 0.18)"
  },
  button: {
    padding: "9px 16px",
    fontSize: "13px",
    fontWeight: 600,
    border: "none",
    borderRadius: "9px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    whiteSpace: "nowrap" as const
  },
  buttonPrimary: {
    background: "#0f5d87",
    color: "#f8fbff",
    boxShadow: "0 4px 10px rgba(15, 93, 135, 0.2)"
  },
  buttonPrimaryHover: {
    transform: "translateY(-1px)",
    boxShadow: "0 8px 14px rgba(15, 93, 135, 0.24)"
  },
  buttonSecondary: {
    border: "1px solid rgba(15, 42, 61, 0.2)",
    color: "#334155",
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    transition: "all 0.2s ease"
  },
  buttonSecondaryHover: {
    backgroundColor: "rgba(250, 253, 255, 1)"
  },
  fileInputLabel: {
    display: "inline-flex",
    gap: "8px",
    alignItems: "center",
    padding: "9px 16px",
    border: "1px solid var(--line)",
    borderRadius: "9px",
    color: "#334155",
    fontWeight: 600,
    cursor: "pointer",
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    transition: "all 0.2s ease"
  },
  fileInputLabelHover: {
    backgroundColor: "rgba(250, 253, 255, 1)"
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "5px 10px",
    backgroundColor: "#f8fafc",
    color: "#475569",
    borderRadius: "999px",
    border: "1px solid var(--line)",
    fontSize: "12px",
    fontWeight: 600
  },
  helper: {
    fontSize: "13px",
    color: "#64748b"
  },
  helperSuccess: {
    color: "#0f5d87",
    fontWeight: 600
  },
  editorArea: {
    flex: 1,
    minHeight: "60vh",
    display: "flex"
  },
  editorWrapper: {
    border: "1px solid var(--line)",
    borderRadius: "14px",
    overflow: "auto",
    boxShadow: "0 6px 18px rgba(15, 23, 42, 0.07)",
    backgroundColor: "#ffffff",
    flex: 1,
    display: "flex",
    flexDirection: "column" as const,
    maxHeight: "70vh",
    height: "70vh"
  },
  loadingFallback: {
    padding: "24px",
    fontSize: "14px",
    color: "#64748b",
    textAlign: "center" as const
  },
  topLinks: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    fontSize: "13px",
    color: "#64748b"
  }
};
