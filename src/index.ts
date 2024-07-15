import joplin from 'api';
import { NoteDialog, NotebookDialog, EditorDialog } from './ui/dialogs';
import { SummarisationPanel } from './ui/panel';

const logger = require('electron-log');

const { initNoteContextMenu } = require('./init/noteContextMenu');
const { initEditorContextMenu } = require('./init/editorContextMenu')
const { initNotebookContextMenu } = require('./init/notebookContextMenu')


joplin.plugins.register({
	onStart: async function() {

		const dataDir = await joplin.plugins.installationDir();

		// Dialogs
		const noteDialog = new NoteDialog('SummarizeSingleNote');
		noteDialog.registerDialog();

		const editorDialog = new EditorDialog('SummarizeSelectedText', dataDir);
		editorDialog.registerDialog();

		const notebookDialog = new NotebookDialog('SummarizeNotebook');
		notebookDialog.registerDialog();

		// Panel
		const panel = new SummarisationPanel();
		panel.registerPanel();

		// Content Menus
		initNoteContextMenu(noteDialog);
		initEditorContextMenu(editorDialog);
		initNotebookContextMenu(notebookDialog);

		logger.info("Joplin AI Summarization plugin has been successfully initialized.")
	},
});

