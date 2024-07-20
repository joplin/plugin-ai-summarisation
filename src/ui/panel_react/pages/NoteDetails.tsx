import * as React from 'react'
import { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import TiptapEditor from '../components/TipTapEditor';
import { useAppContext } from '../AppContext';

const NoteDetailsContainer = styled.div`
    padding: 20px;
`;

export default function NoteDetails() {
    const { summaryState, selectedNoteId } = useAppContext();
    const [editedContent, setEditedContent] = useState("");

    const handleContentChange = (content: string) => {
        setEditedContent(content);
    };

    const displaySummary = useCallback((): string => {
        return summaryState[selectedNoteId].summary;
    }, [selectedNoteId])

    return (
        <NoteDetailsContainer>
            <TiptapEditor key={selectedNoteId} content={displaySummary()} onContentChange={handleContentChange} /> 
        </NoteDetailsContainer>
    );
}
