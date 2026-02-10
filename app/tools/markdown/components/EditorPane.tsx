import React from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import { styles } from "../styles";

type EditorProps = {
  markdown: string;
  onChange: (value: string) => void;
  onImagePicked: (file: File) => Promise<string>;
};

const MDXEditorClient = dynamic(async () => {
  const mod = await import("@mdxeditor/editor");
  const {
    MDXEditor,
    headingsPlugin,
    listsPlugin,
    quotePlugin,
    thematicBreakPlugin,
    linkPlugin,
    linkDialogPlugin,
    imagePlugin,
    tablePlugin,
    codeBlockPlugin,
    sandpackPlugin,
    frontmatterPlugin,
    diffSourcePlugin,
    toolbarPlugin,
    UndoRedo,
    BoldItalicUnderlineToggles,
    CodeToggle,
    ListsToggle,
    BlockTypeSelect,
    CreateLink,
    InsertImage,
    InsertTable,
    InsertThematicBreak,
    InsertCodeBlock,
    DiffSourceToggleWrapper
  } = mod;

  const Component = (props: EditorProps) => (
    <React.Suspense fallback={<div style={styles.loadingFallback}>กำลังโหลด Editor…</div>}>
      <MDXEditor
        markdown={props.markdown}
        onChange={props.onChange}
        plugins={[
          frontmatterPlugin(),
          headingsPlugin(),
          listsPlugin(),
          quotePlugin(),
          thematicBreakPlugin(),
          linkPlugin(),
          linkDialogPlugin(),
          imagePlugin({
            imageUploadHandler: async (file) => props.onImagePicked(file)
          }),
          tablePlugin(),
          codeBlockPlugin(),
          sandpackPlugin(),
          diffSourcePlugin(),
          toolbarPlugin({
            toolbarContents: () => {
              const host = typeof document !== "undefined" ? document.getElementById("mdx-toolbar-host") : null;
              if (!host) return null;
              return createPortal(
                <div className="mdxeditor-toolbar">
                  <DiffSourceToggleWrapper>
                    <UndoRedo />
                    <BoldItalicUnderlineToggles />
                    <CodeToggle />
                    <ListsToggle />
                    <BlockTypeSelect />
                    <CreateLink />
                    <InsertImage />
                    <InsertTable />
                    <InsertCodeBlock />
                    <InsertThematicBreak />
                  </DiffSourceToggleWrapper>
                </div>,
                host
              );
            }
          })
        ]}
      />
    </React.Suspense>
  );

  return {
    default: Component
  };
}, { ssr: false });

type Props = {
  editorKey: number;
  markdown: string;
  onChange: (value: string) => void;
  onImagePicked: (file: File) => Promise<string>;
  onPasteFiles: (files: File[]) => void;
  onContextUpload: () => void;
  onShowContextTools: (x: number, y: number) => void;
};

export default function EditorPane({
  editorKey,
  markdown,
  onChange,
  onImagePicked,
  onPasteFiles,
  onContextUpload,
  onShowContextTools
}: Props): React.ReactElement {
  return (
    <div
      style={styles.editorArea}
      onPasteCapture={(event) => {
        const fileList = Array.from(event.clipboardData?.files || []);
        if (fileList.length) {
          event.preventDefault();
          onPasteFiles(fileList);
          return;
        }
      }}
      onPaste={(event) => {
        const fileList = Array.from(event.clipboardData?.files || []);
        if (fileList.length) {
          event.preventDefault();
          onPasteFiles(fileList);
          return;
        }

        const items = Array.from(event.clipboardData?.items || []);
        const files = items
          .map((item) => (item.kind === "file" ? item.getAsFile() : null))
          .filter((file): file is File => Boolean(file));
        if (files.length) {
          event.preventDefault();
          onPasteFiles(files);
          return;
        }

        const html = event.clipboardData?.getData("text/html") || "";
        if (html.includes("data:image")) {
          const matches = Array.from(html.matchAll(/src=\"(data:image\/[^;]+;base64,[^\"]+)\"/g));
          if (matches.length) {
            event.preventDefault();
            const derivedFiles: File[] = [];
            matches.forEach((match, index) => {
              const dataUrl = match[1];
              const [meta, base64] = dataUrl.split(",", 2);
              if (!base64) return;
              const mime = meta.match(/data:(image\/[^;]+)/)?.[1] || "image/png";
              const binary = atob(base64);
              const bytes = new Uint8Array(binary.length);
              for (let i = 0; i < binary.length; i += 1) {
                bytes[i] = binary.charCodeAt(i);
              }
              const file = new File([bytes], `pasted-${Date.now()}-${index}.png`, { type: mime });
              derivedFiles.push(file);
            });
            if (derivedFiles.length) onPasteFiles(derivedFiles);
            return;
          }
        }

        const rtf = event.clipboardData?.getData("text/rtf") || "";
        if (rtf.includes("\\pict")) {
          event.preventDefault();
          const type = rtf.includes("\\pngblip") ? "image/png" : rtf.includes("\\jpegblip") ? "image/jpeg" : "";
          const pictMatch = rtf.match(/\\pict[\\s\\S]*?}/);
          const raw = pictMatch?.[0] || "";
          const hex = raw.replace(/[^0-9a-fA-F]/g, "");
          if (hex.length > 0 && hex.length % 2 === 0) {
            const bytes = new Uint8Array(hex.length / 2);
            for (let i = 0; i < hex.length; i += 2) {
              bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
            }
            const file = new File([bytes], `pasted-${Date.now()}.png`, { type: type || "image/png" });
            onPasteFiles([file]);
            return;
          }
        }

        if (navigator.clipboard && "read" in navigator.clipboard) {
          event.preventDefault();
          void (async () => {
            try {
              const clipboardItems = await navigator.clipboard.read();
              const derivedFiles: File[] = [];
              for (const item of clipboardItems) {
                for (const type of item.types) {
                  if (!type.startsWith("image/")) continue;
                  const blob = await item.getType(type);
                  derivedFiles.push(new File([blob], `pasted-${Date.now()}.png`, { type }));
                }
              }
              if (derivedFiles.length) onPasteFiles(derivedFiles);
            } catch {
              // ignore
            }
          })();
        }
      }}
      onContextMenu={(event) => {
        event.preventDefault();
        onShowContextTools(event.clientX, event.clientY);
      }}
    >
      <div style={styles.editorWrapper}>
        <MDXEditorClient
          key={editorKey}
          markdown={markdown}
          onChange={onChange}
          onImagePicked={onImagePicked}
        />
      </div>
    </div>
  );
}
