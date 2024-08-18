import joplin from "api";
import { MenuItemLocation } from "api/types";
import { EditorDialog } from "src/ui/dialogs";
import { NoteInfo } from "src/models/note";
import { LexRankHandler } from "../utils/handlers/lex-rank/LexRankHandler";
import { LSAHandler } from "../utils/handlers/lsa/LSAHandler";
import { KMeansClustering } from "../utils/handlers/kmeans-clustering/KMeansHandler";

const SummaryBot = require("summarybot");
const logger = require("electron-log");

async function initEditorContextMenu(editorDialog: EditorDialog) {
  await joplin.commands.register({
    name: "ai.editorCommandContextMenu.textrank",
    label: "Summarize the highlighted text",
    execute: async () => {
      const selectedText = (await joplin.commands.execute(
        "selectedText",
      )) as string;
      const selectedNote = await joplin.workspace.selectedNote();

      logger.info(
        `Editor Context Menu SELECTED TEXT: ${JSON.stringify(selectedText)}`,
      );
      logger.info(
        `Editor Context Menu BODY: ${JSON.stringify(selectedNote["body"])}`,
      );

      logger.info(`Editor Context Menu: ${JSON.stringify(editorDialog)}`);
      const noteInfo: NoteInfo = {
        name: selectedNote["title"],
        noteBody: selectedText,
      };
      const result: any = await editorDialog.openDialog(noteInfo);
      logger.info(`Editor Context Menu RESULT:: ${JSON.stringify(result)}`);

      const summaryConfig: string =
        result["formData"]["note-ai-summarization"];

      if(result.id === "ok") {
        const summaryBot = new SummaryBot();
        const note = await joplin.data.get(["notes", selectedNote["id"]], {
          fields: ["id", "title", "body"],
        });
        let summary = "";

        switch(summaryConfig['summary-model-radio-buttons']) {
          case 'lexRank': {
            const lexRankHandler = new LexRankHandler();
            summary = await lexRankHandler.predict(note['body'], summaryConfig['summary-length-radio-buttons']);
            break;
          }
          case 'lsa': {
            const lsaHandler = new LSAHandler();
            summary = await lsaHandler.predict(note['body'], summaryConfig['summary-length-radio-buttons'])
            break;
          }
          case "textRank": {
            summary = summaryBot.run(note["body"], summaryConfig['summary-length-radio-buttons'], false);
            break;
          }
          case "kmeans": {
            const kmeansHandler = new KMeansClustering();
            summary = await kmeansHandler.predict(note['body'], 5);
            break;
          }
          default: {
            logger.error(`Unknown algorithm in EditorContextMenu: ${summaryConfig['summary-model-radio-buttons']}`);
          }
        }
        const newBody = `## Summarization\n---\n${summary}\n\n---\n\n${note["body"]}`;
        await joplin.commands.execute("textSelectAll");
        await joplin.commands.execute("replaceSelection", String(newBody));
    
      }
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