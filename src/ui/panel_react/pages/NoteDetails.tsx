import * as React from "react";
import { useCallback } from "react";
import styled from "styled-components";
import TiptapEditor from "../components/TipTapEditor";
import { useAppContext } from "../AppContext";
import SummaryConfig from "../components/SummaryConfig";

const NoteDetailsContainer = styled.div`
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export default function NoteDetails() {
  const { summaryState, dispatchSummary, selectedNoteId } = useAppContext();

  const displaySummary = useCallback((): string => {
    return summaryState[selectedNoteId].summary;
  }, [selectedNoteId]);

  if (!(selectedNoteId in summaryState)) {
    return (
      <NoteDetailsContainer>
        <SummaryConfig key={selectedNoteId} />
      </NoteDetailsContainer>
    );
  }

  return (
    <NoteDetailsContainer>
      <TiptapEditor
        key={selectedNoteId}
        content={displaySummary()}
        crafting={false}
        selectedNoteId={selectedNoteId}
        dispatchSummary={dispatchSummary}
      />
    </NoteDetailsContainer>
  );
}
