import joplin from 'api';

const { initNoteContextMenu } = require('./components/noteContextMenu');

joplin.plugins.register({
	onStart: async function() {
		initNoteContextMenu();
	},
});
