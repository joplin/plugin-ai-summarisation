export interface InitPanel {
  type: "initPanel";
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

}

export interface PredictSummary {
  type: "predictSummary";
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

export type Message =
  | InitPanel
  | GetNotes
  | GetSummary
  | UpdateSummaryHTML
  | RequestSummaryObjects
  | PredictSummary
  | RequestSummary
  | RequestSelectedNoteId;
