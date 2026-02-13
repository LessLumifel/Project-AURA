import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import { styles } from "../styles";
import type { MDXEditorMethods } from "@mdxeditor/editor";

type EditorProps = {
  markdown: string;
  onChange: (value: string) => void;
  onImagePicked: (file: File) => Promise<string>;
  onEditorReady?: (methods: MDXEditorMethods | null) => void;
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
    jsxPlugin,
    toolbarPlugin,
    GenericJsxEditor,
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

  const Component = (props: EditorProps) => {
    const editorRef = useRef<MDXEditorMethods>(null);

    useEffect(() => {
      if (props.onEditorReady) props.onEditorReady(editorRef.current);
    }, [props.onEditorReady]);

    return (
      <React.Suspense fallback={<div style={styles.loadingFallback}>กำลังโหลด Editor…</div>}>
        <MDXEditor
          ref={editorRef}
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
            jsxPlugin({
              jsxComponentDescriptors: [
                {
                  name: "span",
                  kind: "text",
                  props: [{ name: "style", type: "string" }],
                  hasChildren: true,
                  Editor: GenericJsxEditor
                }
              ]
            }),
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
  };

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
  onShowContextTools: (x: number, y: number, range: Range | null) => void;
  onSelectionChange: (range: Range | null) => void;
  onEditorReady: (methods: MDXEditorMethods | null) => void;
};

export default function EditorPane({
  editorKey,
  markdown,
  onChange,
  onImagePicked,
  onPasteFiles,
  onContextUpload,
  onShowContextTools,
  onSelectionChange,
  onEditorReady
}: Props): React.ReactElement {
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const captureSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      onSelectionChange(null);
      return;
    }

    const range = selection.getRangeAt(0);
    const root = wrapperRef.current;
    if (!root) return;
    const startInEditor = root.contains(range.startContainer);
    const endInEditor = root.contains(range.endContainer);
    if (!startInEditor || !endInEditor) return;
    onSelectionChange(range.cloneRange());
  };

  return (
    <div
      ref={wrapperRef}
      style={styles.editorArea}
      onMouseUp={captureSelection}
      onKeyUp={captureSelection}
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
        const selection = window.getSelection();
        const range = selection && selection.rangeCount > 0 ? selection.getRangeAt(0).cloneRange() : null;
        onShowContextTools(event.clientX, event.clientY, range);
      }}
    >
      <div style={styles.editorWrapper}>
        <MDXEditorClient
          key={editorKey}
          markdown={markdown}
          onChange={onChange}
          onImagePicked={onImagePicked}
          onEditorReady={onEditorReady}
        />
      </div>
    </div>
  );
}
