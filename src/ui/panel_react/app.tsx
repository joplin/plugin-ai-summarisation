import * as React from 'react';
import styled from 'styled-components';
import { useAppContext } from './AppContext';
import NotebookTree from './components/NotebookTree';
import NoteDetails from './pages/NoteDetails';
import MainHeader from './components/MainHeader';
import NoteDetailsHeader from './components/NoteDetailsHeader';

const AppContainer = styled.div`
    display: flex;
    flex-direction: column;
    padding: 20px;
    height: 100%;
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
    max-height: 400px;
    overflow-y: scroll;
`;

export default function App() {
    const { view, selectedNoteId } = useAppContext();
    const [notebookTree, setNotebookTree] = React.useState([]);

    React.useEffect(() => {
        async function fetchData() {
            const response = await webviewApi.postMessage({ type: 'initPanel' });
            setNotebookTree(response['notebookTree']);
        }
        fetchData();
    }, []);

    return (
        <AppContainer>
            <Header>
                {view === 'home' ? <MainHeader /> : <NoteDetailsHeader />}
            </Header>
            <Body>
                {view === 'home' && Array.isArray(notebookTree) && notebookTree.map(notebook => (
                    <NotebookTree key={notebook.id} notebook={notebook} />
                ))}
                {view === 'noteDetails' && selectedNoteId !== null && (
                    <NoteDetails noteId={selectedNoteId} />
                )}
            </Body>
        </AppContainer>
    );
}
