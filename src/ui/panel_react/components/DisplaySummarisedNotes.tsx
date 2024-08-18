import * as React from "react";
import styled from "styled-components";
import { useAppContext } from "../AppContext";
import { CgNotes } from "react-icons/cg";

const NoteElement = styled.div<{ isSummarized: boolean }>`
  display: flex;
  flex-direction: row;
  gap: 5px;
  align-items: center;
  cursor: pointer;
  background-color: #f7fdff;
  &:hover {
    background-color: #f0f0f0;
  }
  font-size: 12px;
  border-style: solid;
  margin-top: 5px;
  margin-bottom: 5px;
`;

const NoteTitle = styled.div`
  cursor: pointer;
`;

export default function DisplaySummarisedNotes({ notebook }) {
  const { summaryState, setView, setSelectedNoteId, setSelectedNoteTitle } =
    useAppContext();

  const handleNoteClick = async (id: string, noteTitle: string) => {
    setSelectedNoteTitle(noteTitle);
    setSelectedNoteId(id);
    setView("noteDetails");
    await webviewApi.postMessage({ type: "openNoteInJoplin", noteId: id });
  };

  return (
    <div>
      {notebook.notes.map((note) => {
        if (note.id in summaryState) {
          return (
            <NoteElement
              key={note.id}
              onClick={() => handleNoteClick(note.id, summaryState[note.id].summaryTitle)}
              isSummarized={note.id in summaryState}
            >
              <CgNotes />
              <NoteTitle>{summaryState[note.id].summaryTitle}</NoteTitle>
            </NoteElement>
          );
        }
        return null;
      })}
      {notebook.notebooks.map((subNotebook) => (
        <DisplaySummarisedNotes key={subNotebook.id} notebook={subNotebook} />
      ))}
    </div>
  );
}
