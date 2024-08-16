import * as React from "react";
import styled from "styled-components";
import DisplaySummarisedNotes from "../DisplaySummarisedNotes";

const SummarisationListTitle = styled.div`
  margin: 0;
  font-size: 16px;
  font-weight: bold;
`;

export default function SummarisationList({ notebookTree }) {
  return (
    <div>
      <SummarisationListTitle>List of summarised notes</SummarisationListTitle>
      {notebookTree.map((notebook) => (
        <DisplaySummarisedNotes key={notebook.id} notebook={notebook} />
      ))}
    </div>
  );
}
