import joplin from "api";
import { MenuItemLocation } from "api/types";

const SummaryBot = require('summarybot');

async function initEditorContextMenu() {
    await joplin.commands.register({
        name: "ai.editorCommandContextMenu.textrank",
        label: "Summarize the highlighted text",
        execute: async () => {
            const selectedText = (await joplin.commands.execute('selectedText') as string);
            const selectedNote = await joplin.workspace.selectedNote();

            const summaryBot = new SummaryBot();
            const summary = summaryBot.run(selectedText, 3, false)
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