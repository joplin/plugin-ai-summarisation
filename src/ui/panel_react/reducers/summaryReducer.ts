import { SummaryState, SummaryAction, SummaryObject } from "../models/Summary";

export const summaryReducer = (
  state: SummaryState,
  action: SummaryAction,
): SummaryState => {
  switch (action.type) {
    case "addSummary": {
      const { noteId, summary } = action.payload;
      const summaryObj: SummaryObject = {
        noteTitle: "",
        summaryTitle: "",
        summary: summary,
      };
      return {
        ...state,
        [noteId]: summaryObj,
      };
    }
    default:
      return state;
  }
};
