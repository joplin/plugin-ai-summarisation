import joplin from "api";
import { ToolbarButtonLocation } from "api/types";
import { SummarisationPanel } from "src/ui/panel";


async function initWorkers(panelInstance: SummarisationPanel) {
    await initTransformersWorker(panelInstance);
}

async function initTransformersWorker(panelInstance: SummarisationPanel) {
    const transformersWorker = new Worker(`${await joplin.plugins.installationDir()}/workers/transformersWorker.js`);

    joplin.commands.register({
        name: 'classifySelection',
        label: 'Run sentiment analysis on selected text',
        iconName: 'fas fa-robot',
        execute: async () => {
            const selectedText = await joplin.commands.execute('selectedText');
            if (!selectedText) {
                alert('No text selected!');
                return;
            }

            transformersWorker.postMessage({
                type: 'classify',
                text: selectedText,
            });
        },
    });

    joplin.commands.register({
        name: 'transformers:summarise',
        label: 'Run summary prediction on the ',
        iconName: 'fas fa-robot',
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