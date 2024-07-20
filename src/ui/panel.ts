import joplin from "api";
import type { Message } from "./msgTypes";
import { resolve } from "path";
import { ModelType } from "api/types";

const fs = require("fs-extra");
const logger = require("electron-log");

export class SummarisationPanel {
  public panelInstance;
  private sendSummary;
  private sendSummaryObjects;
  private sendSelectedNoteId;

  constructor() {
    this.handleMessage = this.handleMessage.bind(this);
    this.sendSummary = null;
    this.sendSummaryObjects = null;
    this.sendSelectedNoteId = null;
  }

  async showPanel() {
    await joplin.views.panels.show(this.panelInstance, true);
  }

  async hidePanel() {
    await joplin.views.panels.hide(this.panelInstance());
  }

  private async generatePanelHtml() {
    return `
            <div id="root">
            </div>
        `;
  }

  async registerPanel() {
    this.panelInstance = await joplin.views.panels.create("summary-ai-panel");
    const panelHtml: string = await this.generatePanelHtml();
    await joplin.views.panels.setHtml(this.panelInstance, panelHtml);

    const installationDir = await joplin.plugins.installationDir();
    const files = await fs.promises.readdir(
      installationDir + "/ui/panel_react/styles/",
    );
    const cssFiles = files
      .filter((file) => file.endsWith(".css"))
      .map((file) => "ui/panel_react/styles/" + file);

    for (const css of cssFiles) {
      await joplin.views.panels.addScript(this.panelInstance, css);
    }

    await joplin.views.panels.addScript(
      this.panelInstance,
      "./ui/panel_react/index.js",
    );
    await joplin.views.panels.show(this.panelInstance);
    joplin.views.panels.onMessage(this.panelInstance, this.handleMessage);
  }

  async fetchAllNotebooks() {
    const notebooks = await joplin.data.get(["folders"], {
      fields: ["id", "title", "parent_id"],
    });
    const rootNotebooks = [];
    notebooks.items.forEach((notebook) => {
      if (notebook["parent_id"] === "") {
        rootNotebooks.push(notebook);
      }
    });
    return { notebooks: notebooks.items, rootNotebooks: rootNotebooks };
  }

  async fetchAllNotes() {
    const notes = await joplin.data.get(["notes"], {
      fields: ["id", "title", "parent_id", "body"],
    });
    return notes.items;
  }

  async constructNotebookTree(notebooks, notes, notebookTree) {
    for (const currNotebookLevel of notebookTree) {
      notebooks.forEach((notebook) => {
        if (notebook["parent_id"] == currNotebookLevel["id"]) {
          currNotebookLevel["notebooks"].push({
            id: notebook["id"],
            title: notebook["title"],
            parentId: notebook["parent_id"],
            notebooks: [],
            notes: [],
          });
        }
      });

      for(const note of notes) {
        if (note["parent_id"] === currNotebookLevel["id"]) {
          currNotebookLevel["notes"].push(note);
        }
      }

      this.constructNotebookTree(
        notebooks,
        notes,
        currNotebookLevel["notebooks"],
      );
    }
  }

  public async sendSummaryData(summaryObj) {
    if (this.sendSummary) {
      this.sendSummary(summaryObj);
      await joplin.data.userDataSet(ModelType.Note, summaryObj["noteId"], "summaryObj", { summary: summaryObj["summary"], noteId: summaryObj["noteId"] });
      this.sendSummary = null;
    } else {
      logger.error(
        "resolve() Promise object not found for sendSummaryData message type",
      );
    }
  }

  public async sendSummaryObjectsData() {
    const summaryObjects = [];
    const notes = await this.fetchAllNotes();

    for(const note of notes) {
      const summaryObj = await joplin.data.userDataGet(ModelType.Note, note["id"], "summaryObj");
      if(summaryObj !== undefined) {
        summaryObjects.push(summaryObj);
      }
    }
    this.sendSummaryObjects({ summaryObjects: summaryObjects })
  }

  private async handleMessage(msg: Message) {
    switch (msg.type) {
      case "initPanel": {
        const { notebooks, rootNotebooks } = await this.fetchAllNotebooks();
        const notes = await this.fetchAllNotes();

        const notebookTree = [];
        try {
          for (const currNotebook of rootNotebooks) {
            const currId = currNotebook["id"];

            notebookTree.push({
              id: currId,
              title: currNotebook["title"],
              parentId: currNotebook["parent_id"],
              notebooks: [],
              notes: [],
            });
          }
          await this.constructNotebookTree(notebooks, notes, notebookTree);
        } catch (err) {
          logger.error(`Error when constructing notebook tree: ${err}`);
        }

        return { notebookTree };
      }
      case "requestSummaryObjects": {
        return new Promise((resolve) => {
          this.sendSummaryObjects = resolve;
        });
      }
      case "getNotes": {
        const notes = await this.fetchAllNotes();
        return { notes };
      }
      case "getSummary": {

      }
      case "predictSummary": {

      }
      case "requestSummary": {
        return new Promise((resolve) => {
          this.sendSummary = resolve;
        });
      }
      case "requestSelectedNoteId": {
        return new Promise((resolve) => {
          this.sendSelectedNoteId = resolve;
        });
      }
      default: {
        logger.error("Unknown request from webview");
      }
    }
  }
}
