import * as React from "react";
import { useState, useEffect } from "react";
import styled from "styled-components";
import { useAppContext } from "../AppContext";
import {
  Radio,
  RadioGroup,
  Stack,
  Input,
  Button,
  ButtonGroup,
  Textarea,
} from "@chakra-ui/react";
import { IoReload } from "react-icons/io5";

const CraftSummaryContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
`;

const LengthRadioGroup = styled.div`
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
`;

const AlgorithmRadioGroup = styled.div`
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
`;

const SummaryTitleInput = styled.div`
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
`;

export default function SummaryConfig() {
  const {
    selectedNoteId,
    setSelectedNoteId,
    setView,
    craft,
    setCraft,
    dispatchSummary,
  } = useAppContext();
  const [length, setLength] = useState("6");
  const [algorithm, setAlgorithm] = useState("lexRank");

  useEffect(() => {
    fetchPrediction();
  }, [length, algorithm, selectedNoteId]);

  async function fetchPrediction() {
    const prediction = await webviewApi.postMessage({
      type: "predictSummary",
      length: length,
      algorithm: algorithm,
      noteId: selectedNoteId,
    });
    setCraft({ type: "showCraftedSummary", payload: prediction["prediction"] });
  }

  async function storeSummary() {
    await webviewApi.postMessage({
      type: "storeSummary",
      noteId: selectedNoteId,
      summary: `
    <blockquote>
        <p><span style="color: #ffaa00">
            Click on the summary text to edit. You can delete this blockquote.
        </span></p>
    </blockquote>

    ${craft.tempSummary}
    `,
    });
  }

  const handleInputChange = (event) => {
    const inputValue = event.target.value;
    setCraft({ type: "showCraftedSummary", payload: inputValue });
  };

  const handleBackClick = () => {
    setSelectedNoteId(null);
    setView("home");
  };

  const handleSubmitSummary = () => {
    storeSummary();
    setView("home");
    dispatchSummary({
      type: "addSummary",
      payload: {
        noteId: selectedNoteId,
        summary: `
            <blockquote>
                <p><span style="color: #ffaa00">
                    Click on the summary text to edit. You can delete this blockquote.
                </span></p>
            </blockquote>

            ${craft.tempSummary}
            `,
      },
    });

    setTimeout(() => {
      setSelectedNoteId(selectedNoteId);
      setView("noteDetails");
    }, 500);
  };

  return (
    <CraftSummaryContainer>
      <SummaryTitleInput>
        <h3 style={{ fontSize: "15px", fontWeight: "600", width: "180px" }}>
          Summary Title:
        </h3>
        <Input
          variant="flushed"
          size="sm"
          placeholder="WORK IN PROGRESS: Write a title for your summary..."
        />
      </SummaryTitleInput>
      <LengthRadioGroup>
        <h3 style={{ fontSize: "15px", fontWeight: "600" }}>Length:</h3>
        <RadioGroup
          onChange={setLength}
          value={length}
          isDisabled={algorithm === "kmeans"}
        >
          <Stack direction="row">
            <Radio size="sm" value="6">
              Short
            </Radio>
            <Radio size="sm" value="18">
              Medium
            </Radio>
            <Radio size="sm" value="30">
              Long
            </Radio>
          </Stack>
        </RadioGroup>
      </LengthRadioGroup>

      <AlgorithmRadioGroup>
        <h3 style={{ fontSize: "15px", fontWeight: "600" }}>Algorithms:</h3>
        <RadioGroup onChange={setAlgorithm} value={algorithm}>
          <Stack direction="row" alignItems="center">
            <Radio size="sm" value="lexRank">
              LexRank
            </Radio>
            <Radio size="sm" value="textRank">
              TextRank
            </Radio>
            <Radio size="sm" value="lsa">
              LSA
            </Radio>
            <Stack direction="row" alignItems="center">
              <Radio size="sm" value="kmeans">
                KMeans Clustering
              </Radio>
              {algorithm === "kmeans" && (
                <Button
                  style={{ borderRadius: "15px" }}
                  size="xs"
                  onClick={fetchPrediction}
                >
                  <IoReload size={16} />
                </Button>
              )}
            </Stack>
          </Stack>
        </RadioGroup>
      </AlgorithmRadioGroup>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <Textarea
          style={{ height: "280px" }}
          value={craft.tempSummary}
          onChange={handleInputChange}
          placeholder="Here is a sample placeholder"
          size="sm"
        />
        <ButtonGroup variant="outline" spacing="3">
          <Button onClick={handleSubmitSummary} colorScheme="blue">
            Save
          </Button>
          <Button onClick={handleBackClick}>Cancel</Button>
        </ButtonGroup>
      </div>
    </CraftSummaryContainer>
  );
}
