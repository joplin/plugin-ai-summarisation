export interface InitPanel {
  type: "initPanel";
}

export interface OpenNoteInJoplin {
  type: "openNoteInJoplin";
  noteId: string;
}

export interface OpenNoteInPanel {
  type: "openNoteInPanel";
  noteId: string;
}

export interface GetNotes {
  type: "getNotes";
}

export interface GetSummary {
  type: "getSummary";
}

export interface UpdateSummaryHTML {
  type: "updateSummaryHTML";
  summaryHTML: string;
  nodeId: string;
  summaryTitle: string;
}

export interface PredictSummary {
  type: "predictSummary";
  length: string;
  algorithm: string;
  noteId: string;
}

export interface StoreSummary {
  type: "storeSummary";
  noteId: string;
  summary: string;
  summaryTitle: string;
}

export interface RequestNoteContent {
  type: "requestNoteContent";
}

export interface RequestSummaryObjects {
  type: "requestSummaryObjects";
}

export interface RequestSummary {
  type: "requestSummary";
}

export interface RequestSelectedNoteId {
  type: "requestSelectedNoteId";
}

export interface RequestLLMSummary {
  type: "requestLLMSummary";
}

export interface PredictLLMSummary {
  type: "predictLLMSummary";
  noteId: string;
}

export type Message =
  | InitPanel
  | OpenNoteInJoplin
  | GetNotes
  | GetSummary
  | UpdateSummaryHTML
  | RequestSummaryObjects
  | PredictSummary
  | StoreSummary
  | RequestSummary
  | RequestSelectedNoteId
  | RequestNoteContent
  | OpenNoteInPanel
  | RequestLLMSummary
  | PredictLLMSummary;
