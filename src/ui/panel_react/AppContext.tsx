import * as React from "react";
import {
  createContext,
  useContext,
  useState,
  useReducer,
  ReactNode,
} from "react";
import { summaryReducer } from "./reducers/summaryReducer";
import { AppState } from "./models/AppState";

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
  const [selectedNoteId, setSelectedNoteId] = useState<string| null>(null);
  const [summaryState, dispatchSummary] = useReducer(summaryReducer, {});

  return (
    <AppContext.Provider
      value={{
        view,
        setView,
        selectedNoteId,
        setSelectedNoteId,
        summaryState,
        dispatchSummary,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
