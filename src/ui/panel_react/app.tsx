import * as React from 'react';
import styled from 'styled-components';
import { useEffect, useState } from 'react';

import NotebookTree from './components/NotebookTree';

const AppContainer = styled.div`
    display: flex;
    flex-direction: column;
    padding: 20px;
`;

const Header = styled.div`
    background-color: #f5f5f5;
    padding: 10px;
    text-align: center;
`;

const Body = styled.div`
    display: flex;
    flex-direction: column;
    margin-top: 20px;
`;


export default function App() {
    const [notebookTree, setNotebookTree] = useState([]);
    
    useEffect(() => {
        async function fetchData() {
            const response = await webviewApi.postMessage({ type: 'initPanel' });
            setNotebookTree(response['notebookTree']);
        }
        fetchData();
    }, []);

    return (
        <AppContainer>
            <Header>
                <h1>Summarization AI</h1>
            </Header>
            <Body>
                {Array.isArray(notebookTree) && notebookTree.map(notebook => {
                    return (
                        <NotebookTree key={notebook.id} notebook={notebook} />
                    )
                })}
            </Body>
        </AppContainer>
    );
}
