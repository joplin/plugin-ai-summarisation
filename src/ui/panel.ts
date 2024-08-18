import joplin from "api";
import type { Message } from "./msgTypes";
import { MenuItemLocation, ModelType, ToolbarButtonLocation } from "api/types";

import { LexRankHandler } from "../utils/handlers/lex-rank/LexRankHandler";
import { LSAHandler } from "../utils/handlers/lsa/LSAHandler";
import { KMeansClustering } from "../utils/handlers/kmeans-clustering/KMeansHandler";
const SummaryBot = require("summarybot");

const fs = require("fs-extra");
const logger = require("electron-log");

export class SummarisationPanel {
  public panelInstance;
  private sendSummary;
  private sendSummaryObjects;
  private sendSelectedNote;
  private sendSelectedNoteId;
  private sendNoteContent;
  private sendSummaryByLLM;

  constructor() {
    this.handleMessage = this.handleMessage.bind(this);
    this.sendSummary = null;
    this.sendSummaryObjects = null;
    this.sendNoteContent = null;
    this.sendSelectedNote = null;
    this.sendSelectedNoteId = null;
    this.sendSummaryByLLM = null;
  }

  async showPanel() {
    await joplin.views.panels.show(this.panelInstance, true);
  }

  async hidePanel() {
    await joplin.views.panels.hide(this.panelInstance);
  }

  private async generatePanelHtml() {
    return `
            <div id="root">
            </div>
        `;
  }

  async registerPanel() {
    try {
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

      await joplin.commands.register({
        name: "ai.toggle_panel",
        label: "Toggle Joplin AI Summarization panel",
        iconName: "fas fa-robot",
        execute: async () => {
          if (await joplin.views.panels.visible(this.panelInstance)) {
            await joplin.views.panels.hide(this.panelInstance);
          } else {
            await joplin.views.panels.show(this.panelInstance);
            await this.sendSummaryObjectsData();
          }
        },
      });

      await joplin.views.menuItems.create(
        "ai.toggle_panel.menu_item",
        "ai.toggle_panel",
        MenuItemLocation.View,
        { accelerator: "CmdOrCtrl+Shift+F" },
      );

      await joplin.workspace.onNoteSelectionChange(async () => {
        const selectedNote = await joplin.workspace.selectedNote();
        if (this.sendSelectedNote && selectedNote) {
          this.openNoteInPanel();
        }
      });
    } catch(error) {
      throw new Error(`Error while registering the panel: ${error}`);
    }
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

      for (const note of notes) {
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
      await joplin.data.userDataSet(
        ModelType.Note,
        summaryObj["noteId"],
        "summaryObj",
        {
          summary: summaryObj["summary"],
          noteId: summaryObj["noteId"],
          noteTitle: summaryObj["noteTitle"],
          summaryTitle: summaryObj["summaryTitle"],
        },
      );
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

    for (const note of notes) {
      const summaryObj = await joplin.data.userDataGet(
        ModelType.Note,
        note["id"],
        "summaryObj",
      );

      if (summaryObj !== undefined && summaryObj !== null) {
        summaryObjects.push(summaryObj);
      }
    }
    this.sendSummaryObjects({ summaryObjects: summaryObjects });
    return;
  }

  public async openNoteInPanel() {
    if (this.sendSelectedNote) {
      const selectedNote = await joplin.workspace.selectedNote();

      this.sendSelectedNote({ selectedNote: selectedNote });
    }
  }

  private async runPredictionLLMSummary(noteId) {
    const note = await joplin.data.get(["notes", noteId], {
      fields: ["id", "title", "body"],
    });
    const noteBody = note["body"];
    const result = await joplin.commands.execute("transformers:summarise", noteBody);

    return result[0]['summary_text'];
  }

  private async runPredictionSummary(
    length: string,
    algorithm: string,
    noteId: string,
  ) {
    const note = await joplin.data.get(["notes", noteId], {
      fields: ["id", "title", "body"],
    });
    const noteBody = note["body"];

    let kmeansLength = parseInt(length);
    if (algorithm === "kmeans") {
      if (noteBody.length <= 250) {
        kmeansLength = 3;
      }
      if (noteBody.length <= 750) {
        kmeansLength = 6;
      }
      if (noteBody.length > 750) {
        kmeansLength = 12;
      }
    }

    try {
      switch (algorithm) {
        case "lexRank": {
          const handler = new LexRankHandler();
          const prediction = handler.predict(noteBody, parseInt(length));
          return prediction;
        }
        case "textRank": {
          const summaryBot = new SummaryBot();
          const summary = summaryBot.run(noteBody, parseInt(length), false);
          return summary;
        }
        case "lsa": {
          const handler = new LSAHandler();
          const prediction = handler.predict(noteBody, parseInt(length));
          return prediction;
        }
        case "kmeans": {
          logger.info(
            "KMeans Clustering: Request from the panel to run prediction...",
          );
          const handler = new KMeansClustering();
          const prediction = await handler.predict(noteBody, kmeansLength);
          return prediction;
        }
        default: {
          logger.error("Unknown algorithm in runPredictionSummary");
          throw new Error("Unknown algorithm");
        }
      }
    } catch (error) {
      logger.error(`Error in runPredictionSummary: ${error.message}`);
      await joplin.views.dialogs.showMessageBox(
        `Error in runPredictionSummary for the ${algorithm} (algorithm): ${error.message}`,
      );
      throw error;
    }
  }

  private async handleMessage(msg: Message) {
    try {
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
          return new Promise(async(resolve) => {
            this.sendSummaryObjects = resolve;
            await this.sendSummaryObjectsData();
          });
        }
        case "updateSummaryHTML": {
          await joplin.data.userDataSet(
            ModelType.Note,
            msg.nodeId,
            "summaryObj",
            { summary: msg.summaryHTML, noteId: msg.nodeId, summaryTitle: msg.summaryTitle },
          );
          break;
        }
        case "getNotes": {
          const notes = await this.fetchAllNotes();
          return { notes };
        }
        case "predictSummary": {
          const result = await this.runPredictionSummary(
            msg.length,
            msg.algorithm,
            msg.noteId,
          );
          return { prediction: result };
        }
        case "predictLLMSummary": {
          const result = await this.runPredictionLLMSummary(msg.noteId);
          return { prediction: result };
        }
        case "requestSummary": {
          return new Promise((resolve) => {
            this.sendSummary = resolve;
          });
        }
        case "requestLLMSummary": {
          return new Promise((resolve) => {
            this.sendSummaryByLLM = resolve;
          });
        }
        case "requestSelectedNoteId": {
          return new Promise((resolve) => {
            this.sendSelectedNoteId = resolve;
          });
        }
        case "openNoteInJoplin": {
          await joplin.commands.execute("openNote", msg.noteId);
          break;
        }
        case "storeSummary": {
          await joplin.data.userDataSet(
            ModelType.Note,
            msg.noteId,
            "summaryObj",
            { summary: msg.summary, noteId: msg.noteId, summaryTitle: msg.summaryTitle },
          );
          break;
        }
        case "requestNoteContent": {
          return new Promise((resolve) => {
            this.sendNoteContent = resolve;
          });
        }
        case "openNoteInPanel": {
          return new Promise((resolve) => {
            this.sendSelectedNote = resolve;
          });
        }
        default: {
          logger.error(`Unknown request from webview: ${JSON.stringify(msg)}`);
        }
      }
    } catch (error) {
      logger.error(
        `Error handling message of type ${msg.type}: ${error.message}`,
      );
    }
  }
}
