import * as React from 'react';
import NotebookTree from '../NotebookTree';

export default function SummarisationTree({ notebookTree }) {
    return (
        <div>
            {notebookTree.map((notebook) => (
            <NotebookTree key={notebook.id} notebook={notebook} />
          ))}
        </div>
    )
}