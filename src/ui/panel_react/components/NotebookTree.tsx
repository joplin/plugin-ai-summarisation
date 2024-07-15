import * as React from 'react';
import styled from 'styled-components';

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

const NoteTitle = styled.p`
    margin: 0 0 5px 20px;
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
            <NotebookTitle>{notebook.title}</NotebookTitle>
            {notebook.notes.map(note => (
                <NoteTitle key={note.id}>{note.title}</NoteTitle>
            ))}
            {notebook.notebooks.map(subNotebook => (
                <NotebookTree key={subNotebook.id} notebook={subNotebook} level={level + 1} />
            ))}
        </NotebookContainer>
    );
};