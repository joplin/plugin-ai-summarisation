import * as React from "react";
import { useAppContext } from "../AppContext";

import styled from "styled-components";
import { IoArrowBackCircle } from "react-icons/io5";
import { FiEdit2 } from "react-icons/fi";
import { IoSettingsSharp } from "react-icons/io5";


const TopContainer = styled.div`
  display: flex;
  width: 100%;
`

const BackButton = styled.div`
  display: flex;
  cursor: pointer;
  align-items: center;
  gap: 5px;
  margin-bottom: 20px;
  &:hover {
    color: #c5efff;
  }
  width: 20px;
  flex-basis: 50%;
`;

const HeaderSettings = styled.div`
  display: flex;
  flex-direction: row;
  gap: 5px;
  flex-basis: 50%;
  justify-content: flex-end;
`

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
      <TopContainer>
        <BackButton onClick={handleBackClick}>
          <IoArrowBackCircle size={20} />
          <span>Back to Home</span>
        </BackButton>
        <HeaderSettings>
          <FiEdit2 size={20}>
          </FiEdit2>
          <IoSettingsSharp size={20}>
            
          </IoSettingsSharp>
        </HeaderSettings>
      </TopContainer>
      <NoteDetailsTitle>
        {crafting ? "Craft your summary!" : "Summary"}
      </NoteDetailsTitle>

      <NoteDetailsSubtitle>Note: {selectedNoteTitle}</NoteDetailsSubtitle>
    </div>
  );
}
