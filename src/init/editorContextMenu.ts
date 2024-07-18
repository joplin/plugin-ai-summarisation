import joplin from "api";
import { MenuItemLocation } from "api/types";
import { EditorDialog } from "src/ui/dialogs";
import { NoteInfo } from "src/models/note";

const logger = require('electron-log');

async function initEditorContextMenu(editorDialog: EditorDialog) {
    await joplin.commands.register({
        name: "ai.editorCommandContextMenu.textrank",
        label: "Summarize the highlighted text",
        execute: async () => {
            const selectedText = (await joplin.commands.execute('selectedText') as string);
            const selectedNote = await joplin.workspace.selectedNote();

            logger.info(`Editor Context Menu SELECTED TEXT: ${JSON.stringify(selectedText)}`);
            logger.info(`Editor Context Menu BODY: ${JSON.stringify(selectedNote['body'])}`);

            
            logger.info(`Editor Context Menu: ${JSON.stringify(editorDialog)}`);
            const noteInfo: NoteInfo = { "name": selectedNote['title'], "noteBody": selectedText };
            const result: any = await editorDialog.openDialog(noteInfo);
            logger.info(`Editor Context Menu RESULT:: ${JSON.stringify(result)}`);

            const summary: string = result['formData']['note-ai-summarization']['summarized-note-content'];

            const newBody = `## Summarization\n---\n${summary}\n\n---\n\n${selectedNote.body}`

            await joplin.commands.execute("textSelectAll");
            await joplin.commands.execute("replaceSelection", String(newBody));
           
        }
    });
    await joplin.views.menuItems.create('ai.editorCommandContextMenu', 'ai.editorCommandContextMenu.textrank', MenuItemLocation.EditorContextMenu);
}

module.exports = {
    initEditorContextMenu,
}