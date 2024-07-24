import joplin from "api";
import { MenuItemLocation } from "api/types";
import { EditorDialog } from "src/ui/dialogs";
import { NoteInfo } from "src/models/note";
import { LexRankHandler } from "../utils/handlers/lex-rank/LexRankHandler";
import { SummarisationPanel } from "src/ui/panel";

const logger = require("electron-log");

async function initEditorContextMenu(
  editorDialog: EditorDialog,
  panel: SummarisationPanel,
) {
  await joplin.commands.register({
    name: "ai.editorCommandContextMenu.textrank",
    label: "Summarize the highlighted text",
    execute: async () => {
      const selectedText = (await joplin.commands.execute(
        "selectedText",
      )) as string;
      const selectedNote = await joplin.workspace.selectedNote();

      const noteInfo: NoteInfo = {
        name: selectedNote["title"],
        noteBody: selectedText,
      };

      const result: any = await editorDialog.openDialog(noteInfo);

      const inlineSummary: string =
        result["formData"]["note-ai-summarization"]["inline-summary"];

      const handler = new LexRankHandler();
      const summary = handler.predict(selectedText, 10);
      const newBody = `## Summarization\n---\n${summary}\n\n---\n\n${selectedNote.body}`;

      if (inlineSummary === "inline-summary") {
        await joplin.commands.execute("textSelectAll");
        await joplin.commands.execute("replaceSelection", String(newBody));
      }
      const newSummary = `
        <blockquote>
              <p><span style="color: #ffaa00">
                  Click on the summary text to edit. You can delete this blockquote.
              </span></p>
        </blockquote>  

        ${summary}

      `;
      await panel.sendSummaryData({
        summary: newSummary,
        noteId: selectedNote["id"],
        noteTitle: selectedNote["title"],
      });
    },
  });
  await joplin.views.menuItems.create(
    "ai.editorCommandContextMenu",
    "ai.editorCommandContextMenu.textrank",
    MenuItemLocation.EditorContextMenu,
  );
}

module.exports = {
  initEditorContextMenu,
};
