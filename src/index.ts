import joplin from 'api';

const { initNoteContextMenu } = require('./components/noteContextMenu');
const { initEditorContextMenu } = require('./components/editorContextMenu')

joplin.plugins.register({
	onStart: async function() {
		initNoteContextMenu();
		initEditorContextMenu();
	},
});
