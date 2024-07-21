import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import TiptapEditor from "../components/TipTapEditor";
import { useAppContext } from "../AppContext";

import { Radio, RadioGroup, Stack, Input } from '@chakra-ui/react'

const NoteDetailsContainer = styled.div`
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const SummarizationFormContainer = styled.div`
  
`

const LengthRadioGroup = styled.div`
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
`

const AlgorithmRadioGroup = styled.div`
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
`

export default function NoteDetails() {
  const { summaryState, selectedNoteId } = useAppContext();
  const [editedContent, setEditedContent] = useState("");
  const [value, setValue] = React.useState('1')

  const handleContentChange = (content: string) => {
    setEditedContent(content);
  };

  const displaySummary = useCallback((): string => {
    return summaryState[selectedNoteId].summary;
  }, [selectedNoteId]);

  if(!(selectedNoteId in summaryState)) {
    return (
      <NoteDetailsContainer>
        <SummarizationFormContainer>
          <div style={{flex: "display", flexDirection: "row"}}>
            <h3 style={{fontSize: "15px", fontWeight: "600"}}>Summary title:</h3>
            <Input placeholder='Basic usage' />
          </div>
          <LengthRadioGroup>
            <h3 style={{fontSize: "15px", fontWeight: "600"}}>Length:</h3>
            <RadioGroup onChange={setValue} value={value}>
                <Stack direction='row'>
                  <Radio size='sm' value='1'>Short</Radio>
                  <Radio size='sm' value='2'>Medium</Radio>
                  <Radio size='sm' value='3'>Long</Radio>
                </Stack>
            </RadioGroup>
          </LengthRadioGroup>

          <AlgorithmRadioGroup>
            <h3 style={{fontSize: "15px", fontWeight: "600"}}>Algorithms:</h3>
            <RadioGroup onChange={setValue} value={value}>
                <Stack direction='row'>
                  <Radio size='sm' value='1'>LexRank</Radio>
                  <Radio size='sm' value='2'>TextRank</Radio>
                  <Radio size='sm' value='3'>LSA</Radio>
                  <Radio size='sm' value='4'>KMeans Clustering</Radio>
                </Stack>
            </RadioGroup>
          </AlgorithmRadioGroup>
          
          <TiptapEditor
            key={selectedNoteId}
            content={"lol"}
            onContentChange={handleContentChange}
            crafting={true}
            selectedNoteId={selectedNoteId}
          />
        </SummarizationFormContainer>
      </NoteDetailsContainer>
    )
  }

  return (
    <NoteDetailsContainer>
      <TiptapEditor
        key={selectedNoteId}
        content={displaySummary()}
        onContentChange={handleContentChange}
        crafting={false}
        selectedNoteId={selectedNoteId}
      />
    </NoteDetailsContainer>
  );
}
