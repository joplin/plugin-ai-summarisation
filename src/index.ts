import joplin from 'api';
const { initNoteContextMenu } = require('./components/noteContextMenu');
const { initEditorContextMenu } = require('./components/editorContextMenu')
const { initNotebookContextMenu } = require('./components/notebookContextMenu')

const { loadPyodide, version } = require("pyodide");

joplin.plugins.register({
	onStart: async function() {
		initNoteContextMenu();
		initEditorContextMenu();
		initNotebookContextMenu();

		// let pyodide = await loadPyodide({
		// 	indexURL: `${window.location.origin}/pyodide`,
		// });
		// console.log("HEY");
		// await pyodide.loadPackage("micropip");
		// const micropip = pyodide.pyimport("micropip");
		// await micropip.install('snowballstemmer');
		// pyodide.runPython(`
		// import snowballstemmer
		// stemmer = snowballstemmer.stemmer('english')
		// print(stemmer.stemWords('go goes going gone'.split()))
		// `);
	},
	

});
