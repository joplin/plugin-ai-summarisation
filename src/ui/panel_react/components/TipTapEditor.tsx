import * as React from "react";
import {
  useEditor,
  EditorContent,
  FloatingMenu,
  BubbleMenu,
} from "@tiptap/react";
import { Color } from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";
import StarterKit from "@tiptap/starter-kit";
import Blockquote from "@tiptap/extension-blockquote";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";

interface TiptapEditorProps {
  content: string;
  onContentChange: (content: string) => void;
  crafting: boolean;
  selectedNoteId: string;
}

const TiptapEditor: React.FC<TiptapEditorProps> = ({
  content,
  onContentChange,
  crafting,
  selectedNoteId,
}) => {
  const editor = useEditor({
    extensions: [StarterKit, Document, Paragraph, Blockquote, TextStyle, Color],
    content: (!crafting) ?`
    <blockquote>
        <p><span style="color: #ffaa00">
            Click on the summary text to edit. You can delete this blockquote.
        </span></p>
    </blockquote>
    
    ${content}
    ` : `
    ${content}
    `,
    onUpdate: ({ editor }) => {
      onContentChange(editor.getHTML());
      webviewApi.postMessage({ type: "updateSummaryHTML", summaryHTML: String(editor.getHTML()), nodeId: selectedNoteId })
    },
  });

  return (
    <div className="tiptap">
      {editor && (
        <>
          <BubbleMenu
            editor={editor}
            tippyOptions={{ duration: 100 }}
            className="bubble-menu"
          >
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={editor.isActive("bold") ? "is-active" : ""}
            >
              Bold
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={editor.isActive("italic") ? "is-active" : ""}
            >
              Italic
            </button>
            <button
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={editor.isActive("strike") ? "is-active" : ""}
            >
              Strike
            </button>
          </BubbleMenu>
          <FloatingMenu
            editor={editor}
            tippyOptions={{ duration: 100 }}
            className="floating-menu"
          >
            <button
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 1 }).run()
              }
              className={
                editor.isActive("heading", { level: 1 }) ? "is-active" : ""
              }
            >
              H1
            </button>
            <button
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run()
              }
              className={
                editor.isActive("heading", { level: 2 }) ? "is-active" : ""
              }
            >
              H2
            </button>
            <button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={editor.isActive("bulletList") ? "is-active" : ""}
            >
              Bullet list
            </button>
          </FloatingMenu>
        </>
      )}
      <EditorContent editor={editor} />
    </div>
  );
};

export default TiptapEditor;
