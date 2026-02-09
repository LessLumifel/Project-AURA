import React from "react";
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
    markdownShortcutPlugin,
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
          markdownShortcutPlugin(),
          toolbarPlugin({
            toolbarContents: () => (
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
            )
          })
        ]}
      />
    </React.Suspense>
  );

  return { default: Component };
}, { ssr: false });

type Props = {
  editorKey: number;
  markdown: string;
  onChange: (value: string) => void;
  onImagePicked: (file: File) => Promise<string>;
};

export default function EditorPane({
  editorKey,
  markdown,
  onChange,
  onImagePicked
}: Props): React.ReactElement {
  return (
    <div style={styles.editorArea}>
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
