import * as React from 'react';
import styled from 'styled-components';
import { PiNotebookBold } from "react-icons/pi";
import { GiNotebook } from "react-icons/gi";
import { CgNotes } from "react-icons/cg";


interface NotebookContainerProps {
    level: number;
}

const NotebookContainer = styled.div<NotebookContainerProps>`
    margin-left: ${props => props.level * 20}px;
    margin-bottom: 10px;
`;

const NotebookTitle = styled.h2`
    margin: 0;
    cursor: pointer;
`;

const NoteTitle = styled.div`
    cursor: pointer;
`;

interface NotebookProps {
    notebook: {
        id: number;
        title: string;
        notes: { id: number; title: string }[];
        notebooks: NotebookProps['notebook'][];
    };
    
    level?: number;
}

export default function NotebookTree({ notebook, level = 0 }: NotebookProps) {
    return (
        <NotebookContainer level={level}>
            <div className='notebook-title'>
                <GiNotebook />
                <NotebookTitle>{notebook.title}</NotebookTitle>
            </div>
            {notebook.notes.map(note => (
                <p className='note-title'>
                    <CgNotes />
                    <NoteTitle key={note.id}>Note: {note.title}</NoteTitle>
                </p>
            ))}
            {notebook.notebooks.map(subNotebook => (
                <NotebookTree key={subNotebook.id} notebook={subNotebook} level={level + 1} />
            ))}
        </NotebookContainer>
    );
};