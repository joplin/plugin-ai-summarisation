import joplin from "api";
import { NoteDialog, NotebookDialog, EditorDialog } from "./ui/dialogs";
import { SummarisationPanel } from "./ui/panel";
import { ToolbarButtonLocation } from "api/types";

const logger = require("electron-log");
const path = require("path");
const fs = require('fs-extra');

const { initNoteContextMenu } = require("./init/noteContextMenu");
const { initEditorContextMenu } = require("./init/editorContextMenu");
const { initNotebookContextMenu } = require("./init/notebookContextMenu");
const { initWord2Vec } = require("./init/initWord2Vec");

joplin.plugins.register({
  onStart: async function () {
    const dataDir = await joplin.plugins.installationDir();

    // const worker = new Worker(`${await joplin.plugins.installationDir()}/worker.js`);
		// worker.onmessage = event => {
		// 	if ('response' in event.data) {
		// 		alert(
		// 			JSON.stringify(event.data.response)
		// 		);
		// 	}
		// };

		// joplin.commands.register({
		// 	name: 'classifySelection',
		// 	label: 'Run sentiment analysis on selected text',
		// 	iconName: 'fas fa-robot',
		// 	execute: async () => {
		// 		const selectedText = await joplin.commands.execute('selectedText');
    //      console.log(`SELECTED TEXT: ${selectedText}`);
		// 		if (!selectedText) {
		// 			alert('No text selected!');
		// 			return;
		// 		}

		// 		worker.postMessage({
		// 			type: 'classify',
		// 			text: selectedText,
		// 		});
		// 	},
		// });

		// await joplin.views.toolbarButtons.create(
		// 	'classifySelectionButton',
		// 	'classifySelection',
		// 	ToolbarButtonLocation.EditorToolbar,
		// );

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
    await panel.sendSummaryObjectsData();

    // Content Menus
    initNoteContextMenu(noteDialog, panel);
    initEditorContextMenu(editorDialog, panel);
    initNotebookContextMenu(notebookDialog, panel);

    // Word2Vec
    // initWord2Vec();

    logger.info(
      "Joplin AI Summarization plugin has been successfully initialized.",
    );
  },
});
