import { SummaryState } from "./Summary";

export interface AppState {
  view: "home" | "noteDetails";
  selectedNoteId: string | null;
  selectedNoteTitle;
  setView: (view: "home" | "noteDetails") => void;
  setSelectedNoteId: (id: string | null) => void;
  setSelectedNoteTitle;
  summaryState: SummaryState;
  dispatchSummary;
  tempSummary: string;
  setTempSummary;
  craft;
  setCraft;
}
