import joplin from "api";
import { ButtonSpec, DialogResult } from "api/types";
import { NoteInfo } from "src/models/note";
import { NotebookInfo } from "src/models/notebook";

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
    return `
          <form name="note-ai-summarization">
              <div class="note-dialog">
                  <div class="note-summarize-config">
                      <div class="note-title-container">
                          <h2><div class="fas fa-book"</div></h2>
                          <h2 id="note-title">${noteInfo.name}</h2>
                      </div>
                      <h4>NEXT RELEASE: An option of sending note content to the panel to craft the summary</h4>
                      <div>
                        <input type="checkbox" id="inline-summary" name="inline-summary" value="inline-summary" checked>
                        <label for="inline-summary">Put summary in the note</label><br>
                      </div>
                      <div">
                          The summary will also appear in the panel. There you can further craft your summary!
                      </div>
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
                        <h4>WORK IN PROGRESS: Multiple summaries will not be displayed in the panel</h4>
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
                        <h4>NEXT RELEASE: An option of sending note content to the panel to craft the summary</h4>
                        <div>
                          <input type="checkbox" id="inline-summary" name="inline-summary" value="inline-summary" checked>
                          <label for="inline-summary">Put summary in the note</label><br>
                        </div>
                        <div">
                          The summary will also appear in the panel. There you can further craft your summary!
                        </div>
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
