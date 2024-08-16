import joplin from "api";
import { NoteDialog, NotebookDialog, EditorDialog } from "./ui/dialogs";
import { SummarisationPanel } from "./ui/panel";

const logger = require("electron-log");

const { initNoteContextMenu } = require("./init/noteContextMenu");
const { initEditorContextMenu } = require("./init/editorContextMenu");
const { initNotebookContextMenu } = require("./init/notebookContextMenu");
const { initWorkers } = require("./init/initWorkers");

joplin.plugins.register({
  onStart: async function () {
    try {
      const dataDir = await joplin.plugins.installationDir();

      const transformersWorker = new Worker(
        `${await joplin.plugins.installationDir()}/workers/transformersWorker.js`,
      );
      transformersWorker.onmessage = (event) => {
        if ("response" in event.data) {
          alert(JSON.stringify(event.data.response));
        }
      };

      joplin.commands.register({
        name: "classifySelection",
        label: "Run sentiment analysis on selected text",
        iconName: "fas fa-robot",
        execute: async () => {
          const selectedText = await joplin.commands.execute("selectedText");
          if (!selectedText) {
            alert("No text selected!");
            return;
          }

          transformersWorker.postMessage({
            type: "classify",
            text: selectedText,
          });
        },
      });

      // Dialogs
      const noteDialog = new NoteDialog("SummarizeSingleNote");
      noteDialog.registerDialog();

      const editorDialog = new EditorDialog("SummarizeSelectedText", dataDir);
      editorDialog.registerDialog();

      const notebookDialog = new NotebookDialog("SummarizeNotebook");
      notebookDialog.registerDialog();

      // Panel
      const panel = new SummarisationPanel();
      await panel.registerPanel();

      // Content Menus
      initNoteContextMenu(noteDialog, panel);
      initEditorContextMenu(editorDialog, panel);
      initNotebookContextMenu(notebookDialog, panel);

      // Web Workers
      initWorkers()

      logger.info(
        "Joplin AI Summarisation plugin has been successfully initialized.",
      );
    } catch(error) {
      throw new Error(`Error while initialising the Joplin AI Summarisation plugin: ${error}`)
    }
  },
});
