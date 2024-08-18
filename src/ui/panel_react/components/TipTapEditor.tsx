import * as React from "react";
import {
  useEditor,
  EditorContent,
  BubbleMenu,
} from "@tiptap/react";
import { Color } from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";
import StarterKit from "@tiptap/starter-kit";
import Blockquote from "@tiptap/extension-blockquote";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import { FiBold, FiItalic } from "react-icons/fi";
import { AiOutlineStrikethrough } from "react-icons/ai";


interface TiptapEditorProps {
  content: string;
  selectedNoteId: string;
  crafting: boolean;
  dispatchSummary;
  summaryTitle;
}

const TiptapEditor: React.FC<TiptapEditorProps> = ({
  content,
  selectedNoteId,
  crafting,
  dispatchSummary,
  summaryTitle,
}) => {
  const editor = useEditor({
    extensions: [StarterKit, Document, Paragraph, Blockquote, TextStyle, Color],
    content: content,
    onUpdate: ({ editor }) => {
      if (crafting) {
        dispatchSummary({
          type: "updateSummary",
          payload: {
            noteId: selectedNoteId,
            summary: editor.getHTML(),
            summaryTitle: summaryTitle,
          },
        });
      }
      webviewApi.postMessage({
        type: "updateSummaryHTML",
        summaryHTML: String(editor.getHTML()),
        nodeId: selectedNoteId,
        summaryTitle: summaryTitle,
      });
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
              <FiBold/>
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={editor.isActive("italic") ? "is-active" : ""}
            >
              <FiItalic/>
            </button>
            <button
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={editor.isActive("strike") ? "is-active" : ""}
            >
              <AiOutlineStrikethrough/>
            </button>
          </BubbleMenu>
        </>
      )}
      <EditorContent editor={editor} />
    </div>
  );
};

export default TiptapEditor;
