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
    case "updateSummary": {
      const { noteId, summary } = action.payload;
      if(noteId in state) {
        return {
          ...state,
          [noteId]: {
            ...state[noteId],
            summary: summary,
          }
        }
      }
    }
    default:
      return state;
  }
};
