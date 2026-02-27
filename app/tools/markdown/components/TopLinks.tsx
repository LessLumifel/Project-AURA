import { styles } from "../styles";

export default function TopLinks(): React.ReactElement {
  return (
    <div style={styles.topLinks}>
      <a className="button" href="/">
        กลับหน้าแรก
      </a>
      <a className="button" href="/tools/media">
        Media Manager
      </a>
    </div>
  );
}
