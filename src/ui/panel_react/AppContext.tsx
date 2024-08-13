import * as React from "react";
import {
  createContext,
  useContext,
  useState,
  useReducer,
  ReactNode,
} from "react";
import { summaryReducer } from "./reducers/summaryReducer";
import { craftedReducer } from "./reducers/craftReducer";
import { AppState } from "./models/AppState";
import { ToggleView } from "./models/ToggleView";

const AppContext = createContext<AppState | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [view, setView] = useState<"home" | "noteDetails">("home");
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [selectedNoteTitle, setSelectedNoteTitle] = useState<string | null>(
    null,
  );
  const [tempSummary, setTempSummary] = useState<string | null>(null);
  const [summaryState, dispatchSummary] = useReducer(summaryReducer, {});
  const [craft, setCraft] = useReducer(craftedReducer, { tempSummary: "" });
  const [toggleView, setToggleView] = useState<ToggleView>("list");

  return (
    <AppContext.Provider
      value={{
        view,
        setView,
        selectedNoteId,
        setSelectedNoteId,
        selectedNoteTitle,
        setSelectedNoteTitle,
        summaryState,
        dispatchSummary,
        tempSummary,
        setTempSummary,
        craft,
        setCraft,
        toggleView,
        setToggleView,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
