import * as React from "react";
import NotebookTree from "../NotebookTree";
import { Alert, AlertIcon } from "@chakra-ui/react";

export default function SummarisationTree({ notebookTree }) {
  return (
    <div>
    <Alert status='info'>
            <AlertIcon />
            Notes that are marked in orange are summarised.
    </Alert>
      {notebookTree.map((notebook) => (
        <NotebookTree key={notebook.id} notebook={notebook} />
      ))}
    </div>
  );
}
