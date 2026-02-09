import { styles } from "../styles";

export default function HeaderSection(): React.ReactElement {
  return (
    <div style={styles.header}>
      <div>
        <h1 style={styles.title}>MD/MDX Studio</h1>
        <p style={styles.subtitle}>เขียนเอกสารเต็มจอ ส่งออกพร้อมรูปภาพเป็นไฟล์ ZIP</p>
      </div>
      <div style={styles.helper}>รองรับ Markdown, MDX, รูปภาพ และ ZIP export</div>
    </div>
  );
}
