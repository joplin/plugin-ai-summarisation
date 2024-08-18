import * as React from "react";
import { useState } from "react";
import styled from "styled-components";
import { GiNotebook } from "react-icons/gi";
import { CgNotes } from "react-icons/cg";
import { GoTriangleDown, GoTriangleRight } from "react-icons/go";
import { useAppContext } from "../AppContext";

interface NotebookContainerProps {
  level: number;
}

const NotebookContainer = styled.div<NotebookContainerProps>`
  margin-left: ${(props) => props.level * 20}px;
  margin-bottom: 10px;
`;

const NotebookTitle = styled.div`
  margin: 0;
  font-size: 16px;
  font-weight: bold;
`;

const NoteTitle = styled.div`
  cursor: pointer;
`;

const NoteElement = styled.div<{ isSummarized: boolean }>`
  display: flex;
  flex-direction: row;
  gap: 5px;
  align-items: center;
  margin: 6px 0 6px 20px;
  cursor: pointer;
  background-color: ${({ isSummarized }) =>
    isSummarized ? "#FFD564" : "transparent"};
  &:hover {
    background-color: #f0f0f0;
  }
  font-size: 12px;
`;

interface NotebookProps {
  notebook: {
    id: number;
    title: string;
    notes: { id: string; title: string }[];
    notebooks: NotebookProps["notebook"][];
  };
  level?: number;
}

export default function NotebookTree({ notebook, level = 0 }: NotebookProps) {
  const [expanded, setExpanded] = useState(true);
  const { summaryState, setView, setSelectedNoteId, setSelectedNoteTitle } =
    useAppContext();

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  const handleNoteClick = async (id: string, noteTitle: string) => {
    setSelectedNoteTitle(noteTitle);
    setSelectedNoteId(id);
    setView("noteDetails");
    await webviewApi.postMessage({ type: "openNoteInJoplin", noteId: id });
  };

  return (
    <NotebookContainer level={level}>
      <div className="notebook-title" style={{ display: "flex", flexDirection: "row", alignItems: "center" }} onClick={toggleExpand}>
        {expanded ? <GoTriangleDown /> : <GoTriangleRight />}
        <GiNotebook />
        <NotebookTitle>{notebook.title}</NotebookTitle>
      </div>
      {expanded && (
        <div>
          {notebook.notes.map((note) => (
            <NoteElement
              key={note.id}
              onClick={() => handleNoteClick(note.id, note.title)}
              isSummarized={note.id in summaryState}
            >
              <CgNotes />
              <NoteTitle>Note: {note.title}</NoteTitle>
            </NoteElement>
          ))}
          {notebook.notebooks.map((subNotebook) => (
            <NotebookTree
              key={subNotebook.id}
              notebook={subNotebook}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </NotebookContainer>
  );
}
