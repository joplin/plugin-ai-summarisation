import * as React from 'react'
import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaEdit } from "react-icons/fa";
import TiptapEditor from '../components/TipTapEditor';

const NoteDetailsContainer = styled.div`
    padding: 20px;
`;

const NoteTitle = styled.h2`
    margin-top: 0;
`;

const EditButton = styled.div`
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 5px;
    margin-bottom: 20px;
    &:hover {
        color: #007bff;
    }
`;

const SaveButton = styled.button`
    margin-top: 10px;
    padding: 5px 10px;
    cursor: pointer;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    &:hover {
        background-color: #0056b3;
    }
`;

interface NoteDetailsProps {
    noteId: number;
}

export default function NoteDetails({ noteId }: NoteDetailsProps) {
    const [note, setNote] = useState<{ id: number; title: string; body: string } | undefined>(undefined);
    const [isEditing, setIsEditing] = useState(false);
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


    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleContentChange = (content: string) => {
        setEditedContent(content);
    };

    const handleSaveClick = () => {
        setNote(prevNote => prevNote ? { ...prevNote, body: editedContent } : prevNote);
        setIsEditing(false);
    };

    if (!note) {
        return <NoteDetailsContainer>Note not found.</NoteDetailsContainer>;
    }

    return (
        <NoteDetailsContainer>
            {!isEditing && (
                <EditButton onClick={handleEditClick}>
                    <FaEdit size={24} />
                    <span>Edit Note</span>
                </EditButton>
            )}
            <NoteTitle>{note.title}</NoteTitle>
            {isEditing ? (
                <>
                    <TiptapEditor content={editedContent} onContentChange={handleContentChange} />
                    <SaveButton onClick={handleSaveClick}>Save</SaveButton>
                </>
            ) : (
                <TiptapEditor content={note.body} onContentChange={() => {}} /> // Read-only view
            )}
        </NoteDetailsContainer>
    );
}
