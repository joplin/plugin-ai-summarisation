import joplin from 'api';
import { NoteDialog, NotebookDialog } from './ui/dialogs';
import { SummarisationPanel } from './ui/panel';
import { NoteInfo } from './models/note';

const fs = require('fs-extra');
const path = require('path');
const logger = require('electron-log');

const { initNoteContextMenu } = require('./components/noteContextMenu');
const { initEditorContextMenu } = require('./components/editorContextMenu')
const { initNotebookContextMenu } = require('./components/notebookContextMenu')


joplin.plugins.register({
	onStart: async function() {

		// Dialogs
		const noteDialog = new NoteDialog('SummarizeSingleNote');
		noteDialog.registerDialog();

		const notebookDialog = new NotebookDialog('SummarizeNotebook');
		notebookDialog.registerDialog();

		// Panel
		const panel = new SummarisationPanel();
		panel.registerPanel();

		// Content Menus
		initNoteContextMenu(noteDialog);
		initEditorContextMenu();
		initNotebookContextMenu(notebookDialog);

		logger.info("Joplin AI Summarization plugin has been successfully initialized.")
	},
});

async function initWord2Vec() {
	const installationDir = await joplin.plugins.installationDir();
    const dataDir = await joplin.plugins.dataDir();
	console.log(dataDir);
    const word2VecFolder = path.join(dataDir, 'lib', 'word2vec');

    if (!fs.existsSync(word2VecFolder)) {
        const srcFromInstallation = path.join(installationDir, 'lib', 'word2vec');
        await fs.copy(srcFromInstallation, path.join(dataDir, 'lib', 'word2vec'));
    }
}
