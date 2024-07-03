import joplin from 'api';
import { ButtonSpec, DialogResult } from 'api/types';
import { NoteInfo } from 'src/models/note';

import { LexRankHandler } from '../utils/handlers/lex-rank/LexRankHandler';

abstract class Dialog {
    protected _dialog: any;
    protected _title: string;

    constructor(title: string) {
        this._title = title;
    }
}

export class NoteDialog extends Dialog {

    protected _dialog: any;
    protected _title: string;

    constructor(title: string) {
        super(title);
    }
    
    private async generateDialogHtml(noteInfo: NoteInfo): Promise<string> {
        const handler = new LexRankHandler();
        const summary = await handler.predict(noteInfo.noteBody, 10);

        return `
            <div class="note-dialog">
                <div class="note-summarize-config">
                    <h2 id="note-title"> ${noteInfo.name} </h2>
                    <div>
                        <label for="summary-length">Length of the summary<label>
                        <input type="range" title="Summarize with 10 sentences" name="n_papers" id="n_papers" size="25" min="0" max="50" value="10" step="1"
                        oninput="title='Summarize with ' + value + ' sentences'" />
                    </div>
                </div>
                <div class="note-summarized-display">
                    <h2> Summarized Note </h2>
                    <div class="summarized-note-content">
                        ${summary}
                    </div>
                </div>
            </div>
        `
    }

    async registerDialog(buttons?: ButtonSpec[]) {
        this._dialog = await joplin.views.dialogs.create(`note_dialog`);
        console.log(`CREATED DIALOG: ${JSON.stringify(this._dialog)}`);
        await joplin.views.dialogs.addScript(this._dialog, './ui/styles/noteDialogStyle.css');
        await joplin.views.dialogs.addScript(this._dialog, './ui/controllers/noteDialogController.js');
        if (buttons) {
            await joplin.views.dialogs.setButtons(this._dialog, buttons);
        }
    }

    async openDialog(noteInfo: NoteInfo) {
        console.log(`THIS DIALOG: ${this._dialog}`);
        console.log(`THIS TITLE: ${this._title}`);
        const dialogHtml: string = await this.generateDialogHtml(noteInfo);
        console.log(`DIALOG HTML: ${dialogHtml}`);
        await joplin.views.dialogs.setHtml(this._dialog, dialogHtml);
        const result: DialogResult = await joplin.views.dialogs.open(this._dialog);
        return result;
    }
}

export class NotebookDialog extends Dialog {
    
}

export class MultipleNoteDialog extends Dialog {
    
}

export class DoneSummarizationDialog extends Dialog {

}