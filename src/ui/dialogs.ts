import joplin from 'api';
import { ButtonSpec, DialogResult } from 'api/types';
import { NoteInfo } from 'src/models/note';
import { LexRankHandler } from '../utils/handlers/lex-rank/LexRankHandler';
import { LSAHandler } from '../utils/handlers/lsa/LSAHandler';
import { KMeansClustering } from '../utils/handlers/kmeans-clustering/KMeansHandler';

const path = require('path');
const os = require('os'); 
const fs = require('fs');

const SummaryBot = require('summarybot');
const logger = require('electron-log');

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
        const dataDir = await joplin.plugins.dataDir();
        const p = path.join(dataDir, 'summaries_dialog.json');
        if (fs.existsSync(p)) {
            console.log(`The file or directory at '${p}' exists.`);
            await fs.unlink(p, (err) => {
                if (err) {
                    logger.error(`Error deleting JSON file: ${err}`)
                } else {
                    logger.info('File has been deleted successfully.')
                }
            });
        } else {
            console.log(`The file or directory at '${p}' does not exist.`);
        }
        

        const lexRankHandler = new LexRankHandler();
        const lsaHandler = new LSAHandler();
        const kmeansClusteringHandler = new KMeansClustering()
        const textRankHandler = new SummaryBot();

        const lexRank = {handler: lexRankHandler, name: "lexRank"};
        const lsa = {handler: lsaHandler, name: "lsa"};
        const kmeansClustering = {handler: kmeansClusteringHandler, name: "kmeans"};
        const textRank = {handler: textRankHandler, name: "textRank"};

        const summariesJSON = {};
        const summarizers = [lexRank, lsa, textRank];
        const lengthOptions = [6, 18, 30];
        for (const summarizer of summarizers) {
            const temp = {};
            lengthOptions.forEach((nSentences) => {
                if (summarizer["name"] === "textRank") {
                    temp[nSentences.toString()] = summarizer["handler"].run(noteInfo.noteBody, nSentences, false);
                } else {
                    temp[nSentences.toString()] = summarizer["handler"].predict(noteInfo.noteBody, nSentences);
                }
            })
            summariesJSON[summarizer["name"]] = temp;
        }

        const jsonString = JSON.stringify(summariesJSON, null, 2);

        await fs.writeFile(p, jsonString, (err) => {
            if (err) {
                logger.error(`Error writing JSON file: ${err}`)
            } else {
                logger.info('File has been written successfully.')
            }
        });

        return `
            <form name="note-ai-summarization">
                <div class="note-dialog" data-data-dir="${p}">
                    <div class="note-summarize-config">
                        <div class="note-title-container">
                            <h2><div class="fas fa-book"</div></h2>
                            <h2 id="note-title">${noteInfo.name}</h2>
                        </div>
                        <div class="summary-radio-container">
                            <div class="summary-length-radio-container">
                                <div>
                                    <input type="radio" id="length-radio-six" name="summary-length-radio-buttons" value="6" checked>
                                    <label for="length-radio-six">Short</label><br>
                                </div>
                                <div>
                                    <input type="radio" id="length-radio-eighteen" name="summary-length-radio-buttons" value="18">
                                    <label for="length-radio-eighteen">Medium</label><br>
                                </div>
                                <div>
                                    <input type="radio" id="length-radio-thirty" name="summary-length-radio-buttons" value="30">
                                    <label for="length-radio-thirty">Long</label>
                                </div>
                            </div>
                            <div class="summary-model-radio-container">
                                <div>
                                    <input type="radio" id="length-radio-six" name="summary-model-radio-buttons" value="lexRank" checked>
                                    <label for="length-radio-six">LexRank</label><br>
                                </div>
                                <div>
                                    <input type="radio" id="length-radio-eighteen" name="summary-model-radio-buttons" value="lsa" >
                                    <label for="length-radio-eighteen">LSA</label><br>
                                </div>
                                <div>
                                    <input type="radio" id="length-radio-thirty" name="summary-model-radio-buttons" value="textRank">
                                    <label for="length-radio-thirty">TextRank</label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="note-summarized-display">
                        <h2> Summarized Note </h2>
                        <textarea rows="20" name="summarized-note-content" class="summarized-note-content" id="summarized-note-content">
                        </textarea>
                    </div>
                </div>
            </form>
        `
    }

    async registerDialog(buttons?: ButtonSpec[]) {
        this._dialog = await joplin.views.dialogs.create(`note_dialog`);
        await joplin.views.dialogs.addScript(this._dialog, './ui/styles/noteDialogStyle.css');
        await joplin.views.dialogs.addScript(this._dialog, './ui/controllers/noteDialogController.js');
        if (buttons) {
            await joplin.views.dialogs.setButtons(this._dialog, buttons);
        }
    }

    async openDialog(noteInfo: NoteInfo) {
        const dialogHtml: string = await this.generateDialogHtml(noteInfo);
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