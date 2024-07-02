import joplin from 'api';
import { NoteDialog } from './ui/dialogs';
import { NoteInfo } from './models/note';


const fs = require('fs-extra');
const path = require('path');

const { initNoteContextMenu } = require('./components/noteContextMenu');
const { initEditorContextMenu } = require('./components/editorContextMenu')
const { initNotebookContextMenu } = require('./components/notebookContextMenu')


joplin.plugins.register({
	onStart: async function() {
		const noteDialog = new NoteDialog('SummarizeSingleNote');
		noteDialog.registerDialog();

		initNoteContextMenu(noteDialog);
		initEditorContextMenu();
		initNotebookContextMenu();
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
