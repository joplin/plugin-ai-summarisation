import { SummaryAction, SummaryState } from "./Summary";

export interface AppState {
  view: "home" | "noteDetails";
  selectedNoteId: string | null;
  setView: (view: "home" | "noteDetails") => void;
  setSelectedNoteId: (id: string | null) => void;
  summaryState: SummaryState;
  dispatchSummary;
}
