import joplin from 'api';
const { initNoteContextMenu } = require('./components/noteContextMenu');
const { initEditorContextMenu } = require('./components/editorContextMenu')
const { initNotebookContextMenu } = require('./components/notebookContextMenu')

joplin.plugins.register({
	onStart: async function() {
		initNoteContextMenu();
		initEditorContextMenu();
		initNotebookContextMenu();
	},
});
