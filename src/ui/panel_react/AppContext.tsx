import * as  React from 'react';
import { createContext, useContext, useState, ReactNode } from 'react'

interface AppState {
    view: 'home' | 'noteDetails';
    selectedNoteId: number | null;
    setView: (view: 'home' | 'noteDetails') => void;
    setSelectedNoteId: (id: number | null) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
    const [view, setView] = useState<'home' | 'noteDetails'>('home');
    const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null);

    return (
        <AppContext.Provider value={{ view, setView, selectedNoteId, setSelectedNoteId }}>
            {children}
        </AppContext.Provider>
    );
};
