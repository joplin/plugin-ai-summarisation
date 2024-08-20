import joplin from "api";

const path = require("path");
const logger = require("electron-log");

async function initWorkers() {
    await initTransformersWorker();
}

async function initPyodideWorker() {
    logger.info('Initializing Pyodide worker');
    const pyodideWorker = new Worker(`${await joplin.plugins.installationDir()}/workers/pyodideWorker.js`);
}

async function initWord2VecWorker() {
    logger.info('Initializing word2vec worker');
    const word2vecWorker = new Worker(`${await joplin.plugins.installationDir()}/workers/word2vecWorker.js`);
    joplin.commands.register({
        name: 'word2vec:vectorize',
        label: 'Create vectors from sentences',
        execute: async(text, type) => {
            if (!text) {
                alert('No sentences found!');
                return;
            }

            word2vecWorker.postMessage({ type: type, file: path.join(await joplin.plugins.dataDir(), "lib", "word2vec", "vectors.txt"), text: text });
            word2vecWorker.onmessage = async (event) => {
                const model = event.data.model;
            };
        }
    });
}

async function initTransformersWorker() {
    logger.info('Initializing Transformers.js worker');
    const transformersWorker = new Worker(`${await joplin.plugins.installationDir()}/workers/transformersWorker.js`);

    joplin.commands.register({
        name: 'transformers:summarise',
        label: 'Run summary prediction on note content',
        execute: async (text: string) => {
            if (!text) {
                alert('No text detected!');
                return;
            }

            transformersWorker.postMessage({
                type: 'summarise',
                text: text,
            });

            const result = await new Promise((resolve) => {
                transformersWorker.onmessage = (event) => {
                    if ('generatedSummary' in event.data) {
                        resolve(event.data.generatedSummary);
                    } else {
                        console.error('Unexpected data from worker:', event.data);
                    }
                };
            });
            return result;
        },
    });  
}

module.exports = {
    initWorkers,
}