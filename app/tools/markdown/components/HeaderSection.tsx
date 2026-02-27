import { styles } from "../styles";

export default function HeaderSection(): React.ReactElement {
  return (
    <div style={styles.header}>
      <div>
        <h1 style={styles.title}>MD/MDX Studio</h1>
        <p style={styles.subtitle}>เขียนเอกสารแบบเรียบง่ายและส่งออกได้ทันที</p>
      </div>
      <div style={styles.helper}>Markdown • MDX • รูปภาพ • ZIP</div>
    </div>
  );
}
