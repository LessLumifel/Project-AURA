import { styles } from "../styles";

export default function TopLinks(): React.ReactElement {
  return (
    <div style={styles.topLinks}>
      <a className="button" href="/">
        กลับหน้าแรก
      </a>
      <span>เครื่องมือ: Markdown Studio</span>
    </div>
  );
}
