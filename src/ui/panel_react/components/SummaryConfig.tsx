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
  Alert,
  AlertIcon,
  Progress,
  Code,
} from "@chakra-ui/react";

import { IoReload } from "react-icons/io5";


const CraftSummaryContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
`;

const AbstractiveSummarisationContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`

const ExtractiveSummarisationContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`

const SummarisationTypeRadioGroup = styled.div`
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
  font-size: 12px;
`

const LengthRadioGroup = styled.div`
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
  font-size: 12px;
`;

const AlgorithmRadioGroup = styled.div`
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
  font-size: 12px;
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
    selectedNoteTitle,
  } = useAppContext();
  const [length, setLength] = useState("6");
  const [algorithm, setAlgorithm] = useState("lexRank");
  const [summarisationType, setSummarisationType] = useState("extractive");
  const [generatingLLMSummary, setGeneratingLLMSummary] = useState<boolean>(false);
  const [summaryTitle, setSummaryTitle] = useState<string>("");

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

  async function fetchLLMPrediction() {
    try {
        const prediction = await webviewApi.postMessage({
            type: "predictLLMSummary",
            noteId: selectedNoteId, 
        });
        setCraft({ type: "showCraftedSummary", payload: prediction["prediction"] });
    } catch (error) {
        console.error("Error fetching LLM prediction:", error);
    } finally {
        setGeneratingLLMSummary(false);
    }
 }


  async function storeSummary() {
    await webviewApi.postMessage({
      type: "storeSummary",
      noteId: selectedNoteId,
      summaryTitle: summaryTitle,
      summary: `
    <blockquote>
        <p><span style="color: #ffaa00">
            Click on the summary text to edit. You can delete this blockquote.
        </span></p>
    </blockquote>

    ${craft.tempSummary}
    `,
    });
    setSummaryTitle(summaryTitle);
  }

  const handleInputChange = (event) => {
    const inputValue = event.target.value;
    setCraft({ type: "showCraftedSummary", payload: inputValue });
  };

  const handleInputSummaryTitleChange = (event) => {
    const inputValue = event.target.value;
    setSummaryTitle(inputValue);
  }

  const handleBackClick = () => {
    setSelectedNoteId(null);
    setView("home");
  };

  const handlePredictLLMSummary = () => {
    setGeneratingLLMSummary(true);
    fetchLLMPrediction();
  }

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
        summaryTitle: summaryTitle,
      },
    });

    setTimeout(() => {
      setSelectedNoteId(selectedNoteId);
      setView("noteDetails");
    }, 500);
  };

  return (
    <CraftSummaryContainer>
      <div style={{ backgroundColor: "#f7fcff", borderRadius: "6px", padding: "6px" }}>
        <SummaryTitleInput>
            <h3 style={{ fontSize: "13px", fontWeight: "600", width: "180px" }}>
            Summary Title:
            </h3>
            <Input
            value={summaryTitle}
            onChange={handleInputSummaryTitleChange}
            variant="flushed"
            size="sm"
            placeholder="Write a title for your summary..."
            />
        </SummaryTitleInput>
        <SummarisationTypeRadioGroup>
            <h3 style={{ fontSize: "13px", fontWeight: "600" }}>Summarisation Type:</h3>
            <RadioGroup
            onChange={setSummarisationType}
            value={summarisationType}
            >
            <Stack direction="row">
                <Radio size="sm" value="extractive">
                Extractive
                </Radio>
                <Radio size="sm" value="abstractive">
                Abstractive (LLM)
                </Radio>
            </Stack>
            </RadioGroup>
        </SummarisationTypeRadioGroup>
      </div>
    
      { summarisationType === "extractive" ?
      <ExtractiveSummarisationContainer>
        <Alert status='info'>
                <AlertIcon />
                Extractive summarization takes sentences directly from the original
                note, depending on their importance. The summary obtained contains exact
                sentences from the original text.
        </Alert>
        <div>
            <LengthRadioGroup>
                <h3 style={{ fontSize: "13px", fontWeight: "600" }}>Length:</h3>
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
                <h3 style={{ fontSize: "13px", fontWeight: "600" }}>Algorithms:</h3>
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
        </div>
       </ExtractiveSummarisationContainer>
    
      :
      <AbstractiveSummarisationContainer>
        { generatingLLMSummary ? 
            <Progress size='xs' isIndeterminate />

            :
            <Alert status='info'>
                <AlertIcon />
                <p>
                    Abstractive summarization is closer to what a human
                    usually does — i.e., conceive the text, compare it with their memory and related
                    information, and then re-create its core in a brief text
                    <br/>
                    We use <Code style={{ fontSize: "11px" }} colorScheme='yellow' >google/flan_t5_base</Code> for the inference. It will takes approximately on average <b>45 seconds to 2 minutes</b> to generate the summary
                </p>
            </Alert>
        }
        <Button size='sm' onClick={handlePredictLLMSummary} colorScheme="blue" isLoading={generatingLLMSummary} loadingText='Generating'>
            Generate Summary
        </Button>
      </AbstractiveSummarisationContainer>
      }

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
