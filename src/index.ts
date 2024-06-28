import joplin from 'api';

const fs = require('fs-extra');
const path = require('path');
const { loadPyodide, version } = require("pyodide");

const { initNoteContextMenu } = require('./components/noteContextMenu');
const { initEditorContextMenu } = require('./components/editorContextMenu')
const { initNotebookContextMenu } = require('./components/notebookContextMenu')


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
