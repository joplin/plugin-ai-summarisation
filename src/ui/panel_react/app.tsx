import * as React from "react";
import { useEffect } from "react";
import styled from "styled-components";
import { useAppContext } from "./AppContext";
import NotebookTree from "./components/NotebookTree";
import NoteDetails from "./pages/NoteDetails";
import MainHeader from "./components/MainHeader";
import NoteDetailsHeader from "./components/NoteDetailsHeader";

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 20px;
  height: 100%;
`;

const Header = styled.div`
  border-radius: 20px;
  background-color: #f5f5f5;
  padding: 10px;
  text-align: center;
`;

const Body = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 20px;
  max-height: 400px;
  overflow-y: scroll;
`;

export default function App() {
  const { view, selectedNoteId, summaryState, setView, setSelectedNoteId, dispatchSummary } =
    useAppContext();
  const [notebookTree, setNotebookTree] = React.useState([]);

  useEffect(() => {
    async function fetchData() {
      const response = await webviewApi.postMessage({ type: "initPanel" });
      setNotebookTree(response["notebookTree"]);
    }
    async function fetchSummaryObjects() {
      const response = await webviewApi.postMessage({ type: "requestSummaryObjects" });
      for( const summaryObj of response["summaryObjects"]) {
        dispatchSummary({
          type: "addSummary",
          payload: {
            noteId: summaryObj["noteId"],
            summary: summaryObj["summary"],
          },
        });
      }
    }
    async function requestSummary() {
      const response = await webviewApi.postMessage({ type: "requestSummary" });
      dispatchSummary({
        type: "addSummary",
        payload: {
          noteId: response["noteId"],
          summary: response["summary"],
        },
      });
      setView("noteDetails");
      setSelectedNoteId(response["noteId"]);
      requestSummary();
    }
    fetchData();
    fetchSummaryObjects();
    requestSummary();
  }, []);

  return (
    <AppContainer>
      <Header>
        {view === "home" ?  <MainHeader /> : selectedNoteId in summaryState ? <NoteDetailsHeader crafting={false} /> : <NoteDetailsHeader crafting={true} />}
      </Header>
      <Body>
        {view === "home" &&
          Array.isArray(notebookTree) &&
          notebookTree.map((notebook) => (
            <NotebookTree key={notebook.id} notebook={notebook} />
          ))}
        {view === "noteDetails" && selectedNoteId !== null && (
          <NoteDetails key={selectedNoteId} />
        )}
      </Body>
    </AppContainer>
  );
}
