export interface SummaryObject {
  noteTitle: string;
  summaryTitle: string;
  summary: string;
}

export type SummaryState = { [key: string]: SummaryObject };

interface AddSummaryAction {
  type: "addSummary";
  payload: {
    noteId: string;
    summaryTitle: string;
    summary: string;
  };
}

interface UpdateSummaryAction {
  type: "updateSummary";
  payload: {
    noteId: string;
    summarytitle: string;
    summary: string;
  };
}

export type SummaryAction = AddSummaryAction | UpdateSummaryAction;
