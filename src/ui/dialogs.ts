import joplin from "api";
import { ButtonSpec, DialogResult } from "api/types";
import { NoteInfo } from "src/models/note";
import { NotebookInfo } from "src/models/notebook";
import { LexRankHandler } from "../utils/handlers/lex-rank/LexRankHandler";
import { LSAHandler } from "../utils/handlers/lsa/LSAHandler";
import { KMeansClustering } from "../utils/handlers/kmeans-clustering/KMeansHandler";

const path = require("path");
const fs = require("fs");

const SummaryBot = require("summarybot");
const logger = require("electron-log");

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
    const p = path.join(dataDir, "summaries_dialog.json");
    if (fs.existsSync(p)) {
      logger.info(`The file or directory at '${p}' exists.`);
      await fs.unlink(p, (err) => {
        if (err) {
          logger.error(`Error deleting JSON file: ${err}`);
        } else {
          logger.info("File has been deleted successfully.");
        }
      });
    } else {
      logger.info(`The file or directory at '${p}' does not exist.`);
    }

    logger.info("Constructing summarizers...");

    const lexRankHandler = new LexRankHandler();
    const lsaHandler = new LSAHandler();
    const kmeansClusteringHandler = new KMeansClustering();
    const textRankHandler = new SummaryBot();

    const lexRank = { handler: lexRankHandler, name: "lexRank" };
    const lsa = { handler: lsaHandler, name: "lsa" };
    const kmeansClustering = {
      handler: kmeansClusteringHandler,
      name: "kmeans",
    };
    const textRank = { handler: textRankHandler, name: "textRank" };

    const summariesJSON = {};
    const summarizers = [lexRank, lsa, textRank, kmeansClustering];
    const lengthOptions = [6, 18, 30];
    for (const summarizer of summarizers) {
      const temp = {};
      logger.info(`Start summarizing with ${summarizer["name"]}`);

      if (summarizer["name"] === "textRank") {
        lengthOptions.forEach((nSentences) => {
          if (summarizer["name"] === "textRank") {
            temp[nSentences.toString()] = summarizer["handler"].run(
              noteInfo.noteBody,
              nSentences,
              false,
            );
          }
        });
      } else {
        const batchPredictions = summarizer["handler"].predictBatch(
          noteInfo.noteBody,
        );
        temp["6"] = batchPredictions["summaryShort"];
        temp["18"] = batchPredictions["summaryMedium"];
        temp["30"] = batchPredictions["summaryLong"];
      }

      summariesJSON[summarizer["name"]] = temp;
      logger.info(`Summarizing with ${summarizer["name"]} completed`);
    }

    const jsonString = JSON.stringify(summariesJSON, null, 2);

    await fs.writeFile(p, jsonString, (err) => {
      if (err) {
        logger.error(`Error writing JSON file: ${err}`);
      } else {
        logger.info("File has been written successfully.");
      }
    });

    return `
            <form name="note-ai-summarization">
                <div class="note-dialog" data-data-dir="${p}">
                    <div class="note-summarize-config">
                        <div class="note-title-container">
                            <h2><div class="far fa-file-alt"</div></h2>
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
                                <div>
                                    <input type="radio" id="length-radio-thirty" name="summary-model-radio-buttons" value="kmeans">
                                    <label for="length-radio-thirty">KMeans Clustering</label>
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
        `;
  }

  async registerDialog(buttons?: ButtonSpec[]) {
    this._dialog = await joplin.views.dialogs.create(`${this._title}`);
    await joplin.views.dialogs.addScript(
      this._dialog,
      "./ui/styles/noteDialogStyle.css",
    );
    await joplin.views.dialogs.addScript(
      this._dialog,
      "./ui/controllers/noteDialogController.js",
    );
    if (buttons) {
      await joplin.views.dialogs.setButtons(this._dialog, buttons);
    }
  }

  async openDialog(noteInfo: NoteInfo) {
    const dialogHtml: string = await this.generateDialogHtml(noteInfo);
    await joplin.views.dialogs.setHtml(this._dialog, dialogHtml);
    logger.info("Opening a note dialog...");
    const result: DialogResult = await joplin.views.dialogs.open(this._dialog);
    return result;
  }
}

export class NotebookDialog extends Dialog {
  protected _dialog: any;
  protected _title: string;

  constructor(title: string) {
    super(title);
  }

  private async generateDialogHtml(
    notebookInfo: NotebookInfo,
  ): Promise<string> {
    return `
            <form name="note-ai-summarization">
                <div class="note-dialog">
                    <div class="note-summarize-config">
                        <div class="note-title-container">
                            <h2><div class="fas fa-book"</div></h2>
                            <h2 id="note-title">${notebookInfo.name}</h2>
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
                                <div>
                                    <input type="radio" id="length-radio-thirty" name="summary-model-radio-buttons" value="kmeans">
                                    <label for="length-radio-thirty">KMeans Clustering</label>
                                </div>
                            </div>
                        </div>
                        <div class="summary-model-notebook-container">
                            <div>
                                <input type="radio" id="length-radio-six" name="summary-notebook-option" value="immediateChildrenNotes" checked>
                                <label for="length-radio-six">Summarize only notes that selected notebook has</label><br>
                            </div>
                            <div>
                                <input type="radio" id="length-radio-eighteen" name="summary-notebook-option" value="allNotes" >
                                <label for="length-radio-eighteen">Summarize all notes in a selected notebook</label><br>
                            </div>
                            <div>
                                <input type="radio" id="length-radio-eighteen" name="summary-notebook-option" value="customSelectNotes" >
                                <label for="length-radio-eighteen">Select notes to summarize (Work in progress)</label><br>
                            </div>
                        </div>
                    </div>
                    <div class="note-summarized-display">
                        <h2> Work in progress... </h2>
                    </div>
                </div>
            </form>
        `;
  }

  async registerDialog(buttons?: ButtonSpec[]) {
    this._dialog = await joplin.views.dialogs.create(`notebook_dialog`);
    await joplin.views.dialogs.addScript(
      this._dialog,
      "./ui/styles/notebookDialogStyle.css",
    );
    await joplin.views.dialogs.addScript(
      this._dialog,
      "./ui/controllers/notebookDialogController.js",
    );
    if (buttons) {
      await joplin.views.dialogs.setButtons(this._dialog, buttons);
    }
  }

  async openDialog(notebookInfo: NotebookInfo) {
    const dialogHtml: string = await this.generateDialogHtml(notebookInfo);
    await joplin.views.dialogs.setHtml(this._dialog, dialogHtml);
    logger.info("Opening a notebook dialog...");
    const result: DialogResult = await joplin.views.dialogs.open(this._dialog);
    return result;
  }
}

export class EditorDialog extends Dialog {
  protected _dialog: any;
  protected _title: string;
  protected _dataDir: string;

  constructor(title: string, dataDir) {
    super(title);
    this._dataDir = dataDir;
  }

  private async generateDialogHtml(noteInfo: NoteInfo): Promise<string> {
    return `
            <form name="note-ai-summarization">
                <div class="note-dialog">
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
                                <div>
                                    <input type="radio" id="length-radio-thirty" name="summary-model-radio-buttons" value="kmeans">
                                    <label for="length-radio-thirty">KMeans Clustering</label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="note-summarized-display">
                        <h2> Work in progress... </h2>
                    </div>
                </div>
            </form>
        `;
  }

  async registerDialog(buttons?: ButtonSpec[]) {
    this._dialog = await joplin.views.dialogs.create(`${this._title}`);
    await joplin.views.dialogs.addScript(
      this._dialog,
      "./ui/styles/editorDialogStyle.css",
    );
    await joplin.views.dialogs.addScript(
      this._dialog,
      "./ui/controllers/editorDialogController.js",
    );
    if (buttons) {
      await joplin.views.dialogs.setButtons(this._dialog, buttons);
    }
  }

  async openDialog(noteInfo: NoteInfo) {
    const dialogHtml: string = await this.generateDialogHtml(noteInfo);
    await joplin.views.dialogs.setHtml(this._dialog, dialogHtml);
    logger.info("Opening a note dialog...");
    const result: DialogResult = await joplin.views.dialogs.open(this._dialog);
    return result;
  }
}

export class MultipleNoteDialog extends Dialog {}

export class DoneSummarizationDialog extends Dialog {}
