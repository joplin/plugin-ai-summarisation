import joplin from "api";
import { NoteDialog, NotebookDialog, EditorDialog } from "./ui/dialogs";
import { SummarisationPanel } from "./ui/panel";

const logger = require("electron-log");

const { initNoteContextMenu } = require("./init/noteContextMenu");
const { initEditorContextMenu } = require("./init/editorContextMenu");
const { initNotebookContextMenu } = require("./init/notebookContextMenu");
const { initWorkers } = require("./init/initWorkers");
const { initCustomSettings } = require("./init/initCustomSettings");

joplin.plugins.register({
  onStart: async function () {
    try {
      const dataDir = await joplin.plugins.installationDir();

      // Dialogs
      const dialogButtons = [
        {
          id: 'submit',
          title: 'Save'
          
        },
        {
          id: 'cancel',
          title: 'Cancel',
        },
      ]

      const noteDialog = new NoteDialog("SummarizeSingleNote");
      noteDialog.registerDialog(dialogButtons);

      const editorDialog = new EditorDialog("SummarizeSelectedText", dataDir);
      editorDialog.registerDialog(dialogButtons);

      const notebookDialog = new NotebookDialog("SummarizeNotebook");
      notebookDialog.registerDialog(dialogButtons);

      // Panel
      const panel = new SummarisationPanel();
      await panel.registerPanel();

      // Content Menus
      initNoteContextMenu(noteDialog);
      initEditorContextMenu(editorDialog);
      initNotebookContextMenu(notebookDialog);

      // Web Workers
      initWorkers();

      // Settings
      initCustomSettings();

      logger.info(
        "Joplin AI Summarisation plugin has been successfully initialized.",
      );
    } catch(error) {
      throw new Error(`Error while initialising the Joplin AI Summarisation plugin: ${error}`)
    }
  },
});
