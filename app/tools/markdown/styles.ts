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
    color: "var(--ink-0)",
    background: "linear-gradient(135deg, var(--ice-1) 0%, var(--ice-2) 50%, var(--ice-3) 100%)",
    WebkitBackgroundClip: "text" as const,
    WebkitTextFillColor: "transparent"
  },
  subtitle: {
    fontSize: "14px",
    color: "var(--ink-2)",
    margin: "4px 0 0 0"
  },
  controlsSection: {
    display: "flex",
    gap: "14px",
    alignItems: "center",
    flexWrap: "wrap" as const,
    padding: "16px 18px",
    backgroundColor: "rgba(12, 20, 44, 0.65)",
    borderRadius: "16px",
    border: "1px solid var(--line)",
    boxShadow: "0 12px 32px rgba(6, 10, 24, 0.45)",
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
    color: "var(--ink-1)",
    whiteSpace: "nowrap" as const
  },
  input: {
    padding: "10px 12px",
    fontSize: "14px",
    border: "1px solid rgba(148, 163, 184, 0.4)",
    borderRadius: "10px",
    fontFamily: "inherit",
    transition: "all 0.2s ease",
    flex: 1,
    minWidth: "200px",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    color: "#0b1020"
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
    background: "linear-gradient(135deg, #6ad7ff 0%, #7b7bff 65%, #9a8bff 100%)",
    color: "#071020",
    boxShadow: "0 8px 18px rgba(106, 215, 255, 0.25)"
  },
  buttonPrimaryHover: {
    transform: "translateY(-2px)",
    boxShadow: "0 12px 26px rgba(106, 215, 255, 0.35)"
  },
  buttonSecondary: {
    border: "1px solid rgba(98, 227, 255, 0.35)",
    color: "var(--ink-0)",
    backgroundColor: "rgba(16, 28, 60, 0.7)",
    transition: "all 0.2s ease"
  },
  buttonSecondaryHover: {
    backgroundColor: "rgba(98, 227, 255, 0.2)"
  },
  fileInputLabel: {
    display: "inline-flex",
    gap: "8px",
    alignItems: "center",
    padding: "10px 18px",
    border: "1px solid rgba(98, 227, 255, 0.35)",
    borderRadius: "10px",
    color: "var(--ink-0)",
    fontWeight: 600,
    cursor: "pointer",
    backgroundColor: "rgba(16, 28, 60, 0.7)",
    transition: "all 0.2s ease"
  },
  fileInputLabelHover: {
    backgroundColor: "rgba(98, 227, 255, 0.25)"
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 12px",
    backgroundColor: "rgba(98, 227, 255, 0.2)",
    color: "var(--ink-0)",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: 600
  },
  helper: {
    fontSize: "13px",
    color: "var(--ink-2)"
  },
  helperSuccess: {
    color: "#6fffc7",
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
    overflow: "hidden",
    boxShadow: "0 20px 50px rgba(6, 10, 24, 0.45)",
    backgroundColor: "white",
    flex: 1,
    display: "flex"
  },
  loadingFallback: {
    padding: "24px",
    fontSize: "14px",
    color: "var(--ink-2)",
    textAlign: "center" as const
  },
  topLinks: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    fontSize: "14px",
    color: "var(--ink-1)"
  }
};
