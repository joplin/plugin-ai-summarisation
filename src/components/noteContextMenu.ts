import joplin from "api";
import { MenuItemLocation } from "api/types";
import { LexRankHandler } from "../utils/handlers/lex-rank/LexRankHandler";
import { LSAHandler } from "../utils/handlers/lsa/LSAHandler";
import { KMeansClustering } from "../utils/handlers/kmeans-clustering/KMeansHandler";
import { NoteDialog } from "src/ui/dialogs";
import { NoteInfo } from "src/models/note";

const SummaryBot = require('summarybot');
const userTriggered = true;

async function summarizeNoteContextMenu(note, multiple: boolean, noteDialog) {
    const handler = new LexRankHandler();
    const summary = await handler.predict(note['body']);
    const noteInfo: NoteInfo = { "name": note['title'], "noteBody": note['body'] };
    const result: any = await noteDialog.openDialog(noteInfo);

    setTimeout(() => createSummary(note, multiple, summary), 1000);
}
async function createSummary(note, multiple, summary) {
    const newBody = `## Summarization\n---\n${summary}\n\n---\n\n${note['body']}`
    if (!multiple) {
        const selectedNote = await joplin.workspace.selectedNote();
        const codeView = await joplin.settings.globalValue("editor.codeView");
        const noteVisiblePanes = await joplin.settings.globalValue("noteVisiblePanes");
        if (
            selectedNote.id === note["id"] &&
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
    } else {
        await joplin.data.put(['notes', note["id"]], null, { body: String(newBody) });
    }
}

async function initNoteContextMenu(noteDialog: NoteDialog) {

    await joplin.commands.register({
        name: 'ai.noteListContextMenu.textrank',
        label: 'Summarize the note',
        execute: async (noteIds: string[] = null) => {
            if (noteIds.length === 1) {
                const note = await joplin.data.get(['notes', noteIds[0]], { fields: ['id', 'title', 'body'] });
                summarizeNoteContextMenu(note, false, noteDialog);
            } else if (noteIds.length > 1) {
                for (const noteId of noteIds) {
                    const note = await joplin.data.get(['notes', noteId], { fields: ['id', 'title', 'body'] });
                    summarizeNoteContextMenu(note, true, noteDialog);
                }
            }
        },
    });
    await joplin.views.menuItems.create('ai.noteListContextMenu', 'ai.noteListContextMenu.textrank', MenuItemLocation.NoteListContextMenu);
}

module.exports = {
    initNoteContextMenu,
};
