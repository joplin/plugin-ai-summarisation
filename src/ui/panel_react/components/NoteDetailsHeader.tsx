import * as React from "react";
import { useAppContext } from "../AppContext";

import styled from "styled-components";
import { IoArrowBackCircle } from "react-icons/io5";

const BackButton = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 20px;
  &:hover {
    color: #c5efff;
  }
`;

const NoteDetailsTitle = styled.h1`
  position: relative;
  top: -20px;
  font-size: 28px;
  font-weight: 600;
`;

const NoteDetailsSubtitle = styled.h1`
  position: relative;
  font-size: 16px;
  font-weight: 400;
`;

export default function NoteDetailsHeader({ crafting }) {
  const { selectedNoteTitle, setView, setSelectedNoteId } = useAppContext();

  const handleBackClick = () => {
    setSelectedNoteId(null);
    setView("home");
  };

  return (
    <div className="note-header">
      <BackButton onClick={handleBackClick}>
        <IoArrowBackCircle size={24} />
        <span>Back to Home</span>
      </BackButton>
      <NoteDetailsTitle>
        {crafting ? "Craft your summary!" : "Summary"}
      </NoteDetailsTitle>
      <NoteDetailsSubtitle>Note: {selectedNoteTitle}</NoteDetailsSubtitle>
    </div>
  );
}
