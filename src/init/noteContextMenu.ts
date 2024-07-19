import joplin from "api";
import { MenuItemLocation } from "api/types";
import { NoteDialog } from "src/ui/dialogs";
import { NoteInfo } from "src/models/note";
import { SummarisationPanel } from "src/ui/panel";

const logger = require('electron-log');
const userTriggered = true;

async function summarizeNoteContextMenu(note, multiple: boolean, noteDialog, panel: SummarisationPanel) {
    const noteInfo: NoteInfo = { "name": note['title'], "noteBody": note['body'] };
    const result: any = await noteDialog.openDialog(noteInfo);
    panel.sendSummaryData({ "summary": result['formData']['note-ai-summarization']['summarized-note-content'] })

    setTimeout(() => createSummary(note, multiple, result['formData']['note-ai-summarization']['summarized-note-content']), 1000);
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

async function initNoteContextMenu(noteDialog: NoteDialog, panel: SummarisationPanel) {

    await joplin.commands.register({
        name: 'ai.noteListContextMenu.textrank',
        label: 'Summarize the note',
        execute: async (noteIds: string[] = null) => {
            if (noteIds.length === 1) {
                const note = await joplin.data.get(['notes', noteIds[0]], { fields: ['id', 'title', 'body'] });
                summarizeNoteContextMenu(note, false, noteDialog, panel);
            } else if (noteIds.length > 1) {
                for (const noteId of noteIds) {
                    const note = await joplin.data.get(['notes', noteId], { fields: ['id', 'title', 'body'] });
                    summarizeNoteContextMenu(note, true, noteDialog, panel);
                }
            }
        },
    });
    await joplin.views.menuItems.create('ai.noteListContextMenu', 'ai.noteListContextMenu.textrank', MenuItemLocation.NoteListContextMenu);
}

module.exports = {
    initNoteContextMenu,
};
