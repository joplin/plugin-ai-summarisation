import * as React from 'react'
import { useState, useEffect } from 'react';
import styled from 'styled-components';
import TiptapEditor from '../components/TipTapEditor';
import { useAppContext } from '../AppContext';

const NoteDetailsContainer = styled.div`
    padding: 20px;
`;

const NoteTitle = styled.h2`
    margin-top: 0;
`;

interface NoteDetailsProps {
    noteId: number;
}

export default function NoteDetails({ noteId }: NoteDetailsProps) {
    const { summaryState } = useAppContext();
    const [note, setNote] = useState<{ id: number; title: string; body: string } | undefined>(undefined);
    const [editedContent, setEditedContent] = useState("");

    useEffect(() => {
        async function getNotes() {
            const response = await webviewApi.postMessage({ type: "getNotes" });
            const notes = response['notes'];
            const findNote = notes.find((note: { id: number }) => note.id === noteId);
            setNote(findNote);
            setEditedContent(findNote?.body || "");
        }
        getNotes();
    }, [noteId]);


    const handleContentChange = (content: string) => {
        setEditedContent(content);
    };

    if (!note) {
        return <NoteDetailsContainer>Note not found.</NoteDetailsContainer>;
    }

    return (
        <NoteDetailsContainer>
            <NoteTitle>{note.title}</NoteTitle>
            <TiptapEditor content={summaryState[note.id].summary} onContentChange={handleContentChange} /> 
        </NoteDetailsContainer>
    );
}
