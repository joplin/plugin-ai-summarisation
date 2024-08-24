import * as React from "react";
import { useEffect } from "react";
import styled from "styled-components";
import { useAppContext } from "./AppContext";
import NoteDetails from "./pages/NoteDetails";
import MainHeader from "./components/MainHeader";
import NoteDetailsHeader from "./components/NoteDetailsHeader";
import Home from "./pages/Home";

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 20px;
  height: 100%;
`;

const Header = styled.div`
  border-radius: 20px;
  background-color: #f5f5f5;
  padding: 5px;
  text-align: center;
`;

const Body = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 20px;
  max-height: 900px;
  overflow-y: scroll;

  @media (max-height: 700px) {
    max-height: 430px;
  }

  @media (max-height: 770px) {
    max-height: 450px;
  }

  @media (max-height: 400px) {
    max-height: 320px;
  }
`;

export default function App() {
  const {
    view,
    selectedNoteId,
    summaryState,
    setView,
    setSelectedNoteId,
    setSelectedNoteTitle,
    dispatchSummary,
  } = useAppContext();
  const [notebookTree, setNotebookTree] = React.useState([]);

  useEffect(() => {
    try {
      async function fetchData() {
        const response = await webviewApi.postMessage({ type: "initPanel" });
        setNotebookTree(response["notebookTree"]);
      }
      async function fetchSummaryObjects() {
        const response = await webviewApi.postMessage({
          type: "requestSummaryObjects",
        });
        for (const summaryObj of response["summaryObjects"]) {

          if (!(summaryObj["noteId"] in summaryState)) {
            dispatchSummary({
              type: "addSummary",
              payload: {
                noteId: summaryObj["noteId"],
                summary: summaryObj["summary"],
                summaryTitle: summaryObj["summaryTitle"],
              },
            });
          }
        }
      }
      async function requestSummary() {
        const response = await webviewApi.postMessage({ type: "requestSummary" });
        dispatchSummary({
          type: "addSummary",
          payload: {
            noteId: response["noteId"],
            summary: response["summary"],
            summaryTitle: response["summaryTitle"],
          },
        });
        setView("noteDetails");
        setSelectedNoteId(response["noteId"]);
      }
      async function noteOnChange() {
        const response = await webviewApi.postMessage({
          type: "openNoteInPanel",
        });
        setView("noteDetails");
        setSelectedNoteId(response["selectedNote"]["id"]);
      }
      fetchSummaryObjects();
      fetchData();
      requestSummary();
      noteOnChange();
    } catch(error) {
      throw new Error(`App failed when loading summaries and objects (app.tsx): ${error}`);
    }
  }, [selectedNoteId]);

  return (
    <AppContainer>
      <Header>
        {view === "home" ? (
          <MainHeader />
        ) : selectedNoteId in summaryState ? (
          <NoteDetailsHeader crafting={false} />
        ) : (
          <NoteDetailsHeader crafting={true} />
        )}
      </Header>
      <Body>
        {view === "home" && <Home notebookTree={notebookTree} />}
        {view === "noteDetails" && selectedNoteId !== null && (
          <NoteDetails key={selectedNoteId} />
        )}
      </Body>
    </AppContainer>
  );
}
