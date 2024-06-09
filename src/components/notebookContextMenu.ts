import joplin from "api";
import { MenuItemLocation } from "api/types";

const SummaryBot = require('summarybot');
const userTriggered = true;

async function summarizeNotesRecursively(parentId, allNotes, allNotebooks) {
    if (parentId === null || parentId === undefined) {
        return;
    }

    const notebooksToContinue = [];
    for (const currNotebook of allNotebooks) {
        if (currNotebook['parent_id'] === parentId) {
            notebooksToContinue.push(currNotebook);
        }
    }

    for (const currNote of allNotes) {
        if (currNote['parent_id'] === parentId) {
            const summaryBot = new SummaryBot();
            const note = await joplin.data.get(['notes', currNote['id']], { fields: ['id', 'title', 'body'] });
            const summary = summaryBot.run(note['body'], 3, false)
            const newBody = `## Summarization\n---\n${summary}\n\n---\n\n${note['body']}`

            const selectedNote = await joplin.workspace.selectedNote();
            const codeView = await joplin.settings.globalValue("editor.codeView");
            const noteVisiblePanes = await joplin.settings.globalValue("noteVisiblePanes");
            if (
                selectedNote.id === currNote["id"] &&
                codeView === true &&
                (noteVisiblePanes === "viewer" || userTriggered === true)
                ) {
                await joplin.commands.execute("textSelectAll");
                await joplin.commands.execute("replaceSelection", String(newBody));
            } else if (selectedNote.id !== note["id"]) {
                await joplin.data.put(['notes', note["id"]], null, { body: String(newBody) });
            } else {
                console.log('No summarization');
            }
        }
    }

    for (const traverseNotebook of notebooksToContinue) {
        summarizeNotesRecursively(traverseNotebook['id'], allNotes, allNotebooks);
    }
}

async function initNotebookContextMenu() {
    await joplin.commands.register({
        name: "ai.notebookCommandContextMenu.textrank",
        label: "Summarize the notebook",
        execute: async (folderId: string) => {
            const allNotebooks = await joplin.data.get(['folders']);
            const allNotes = await joplin.data.get(['notes']);
            console.log(`NOTEBOOKS: ${JSON.stringify(allNotebooks)}`);
            console.log(`NOTES: ${JSON.stringify(allNotes)}`);
            

            summarizeNotesRecursively(folderId, allNotes['items'], allNotebooks['items']);
        }
    });
    await joplin.views.menuItems.create('ai.notebookCommandContextMenu', 'ai.notebookCommandContextMenu.textrank', MenuItemLocation.FolderContextMenu);
}

module.exports = {
    initNotebookContextMenu,
}