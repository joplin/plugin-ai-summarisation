import { SummaryState, SummaryAction, SummaryObject } from "../models/Summary";

export const summaryReducer = (
  state: SummaryState,
  action: SummaryAction,
): SummaryState => {
  try {
    switch (action.type) {
      case "addSummary": {
        const { noteId, summary, summaryTitle } = action.payload;
        const summaryObj: SummaryObject = {
          noteTitle: "",
          summaryTitle: summaryTitle || "",
          summary: summary || "",
        };
        return {
          ...state,
          [noteId]: summaryObj,
        };
      }
      case "updateSummary": {
        const { noteId, summary, summarytitle } = action.payload;
        if (noteId in state) {
          return {
            ...state,
            [noteId]: {
              ...state[noteId],
              summary: summary,
              summaryTitle: summarytitle,
            },
          };
        }
      }

      default:
        return state;
    }
  } catch (error) {
    throw error;
  }
};
