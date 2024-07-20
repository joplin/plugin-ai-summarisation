import { SummaryAction, SummaryState } from "./Summary";

export interface AppState {
    view: "home" | "noteDetails";
    selectedNoteId: number | null;
    setView: (view: "home" | "noteDetails") => void;
    setSelectedNoteId: (id: number | null) => void;
    summaryState: SummaryState;
    dispatchSummary;
}