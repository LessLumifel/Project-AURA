import { Suspense } from "react";
import MarkdownViewerClient from "./ViewerClient";

export default function MarkdownViewerPage(): React.ReactElement {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>กำลังโหลด…</div>}>
      <MarkdownViewerClient />
    </Suspense>
  );
}
