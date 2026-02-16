export const styles = {
  page: {
    minHeight: "100vh",
    width: "100%",
    background: "transparent"
  },
  container: {
    padding: "28px 24px 32px 24px",
    maxWidth: "1200px",
    margin: "0 auto",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column" as const,
    gap: "16px",
    fontFamily: "'Space Grotesk', system-ui, sans-serif"
  },
  header: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: "16px",
    flexWrap: "wrap" as const
  },
  title: {
    fontSize: "30px",
    fontWeight: 700,
    margin: 0,
    color: "#1e293b",
    background: "linear-gradient(135deg, #0f766e 0%, #0284c7 50%, #0891b2 100%)",
    WebkitBackgroundClip: "text" as const,
    WebkitTextFillColor: "transparent"
  },
  subtitle: {
    fontSize: "14px",
    color: "#64748b",
    margin: "4px 0 0 0"
  },
  controlsSection: {
    display: "flex",
    gap: "14px",
    alignItems: "center",
    flexWrap: "wrap" as const,
    padding: "16px 18px",
    backgroundColor: "var(--panel)",
    borderRadius: "16px",
    border: "1px solid rgba(8, 145, 178, 0.35)",
    boxShadow: "0 10px 24px rgba(8, 145, 178, 0.16)",
    backdropFilter: "blur(10px)"
  },
  labelSection: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    flex: 1,
    minWidth: "240px"
  },
  label: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#155e75",
    whiteSpace: "nowrap" as const
  },
  input: {
    padding: "10px 12px",
    fontSize: "14px",
    border: "1px solid rgba(8, 145, 178, 0.35)",
    borderRadius: "10px",
    fontFamily: "inherit",
    transition: "all 0.2s ease",
    flex: 1,
    minWidth: "200px",
    backgroundColor: "rgba(224, 242, 254, 0.95)",
    color: "#0c4a6e"
  } as React.CSSProperties,
  inputFocus: {
    outline: "none",
    borderColor: "#5bbcff",
    boxShadow: "0 0 0 3px rgba(91, 188, 255, 0.2)"
  },
  button: {
    padding: "10px 18px",
    fontSize: "14px",
    fontWeight: 600,
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    whiteSpace: "nowrap" as const
  },
  buttonPrimary: {
    background: "linear-gradient(135deg, #67e8f9 0%, #38bdf8 55%, #0ea5e9 100%)",
    color: "#0f172a",
    boxShadow: "0 8px 18px rgba(96, 165, 250, 0.25)"
  },
  buttonPrimaryHover: {
    transform: "translateY(-2px)",
    boxShadow: "0 12px 24px rgba(96, 165, 250, 0.35)"
  },
  buttonSecondary: {
    border: "1px solid rgba(8, 145, 178, 0.4)",
    color: "#0c4a6e",
    backgroundColor: "rgba(186, 230, 253, 0.78)",
    transition: "all 0.2s ease"
  },
  buttonSecondaryHover: {
    backgroundColor: "rgba(165, 243, 252, 0.92)"
  },
  fileInputLabel: {
    display: "inline-flex",
    gap: "8px",
    alignItems: "center",
    padding: "10px 18px",
    border: "1px solid rgba(8, 145, 178, 0.4)",
    borderRadius: "10px",
    color: "#0c4a6e",
    fontWeight: 600,
    cursor: "pointer",
    backgroundColor: "rgba(186, 230, 253, 0.78)",
    transition: "all 0.2s ease"
  },
  fileInputLabelHover: {
    backgroundColor: "rgba(165, 243, 252, 0.92)"
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 12px",
    backgroundColor: "rgba(165, 243, 252, 0.78)",
    color: "#0f766e",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: 600
  },
  helper: {
    fontSize: "13px",
    color: "#64748b"
  },
  helperSuccess: {
    color: "#047857",
    fontWeight: 600
  },
  editorArea: {
    flex: 1,
    minHeight: "60vh",
    display: "flex"
  },
  editorWrapper: {
    border: "1px solid rgba(148, 163, 184, 0.35)",
    borderRadius: "18px",
    overflow: "auto",
    boxShadow: "0 14px 28px rgba(8, 145, 178, 0.2)",
    backgroundColor: "rgba(201, 227, 244, 0.88)",
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
    gap: "12px",
    alignItems: "center",
    fontSize: "14px",
    color: "#475569"
  }
};
