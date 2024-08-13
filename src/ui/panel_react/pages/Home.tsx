import * as React from 'react'
import styled from 'styled-components';
import { LuFolderTree } from "react-icons/lu";
import { IoList } from "react-icons/io5";
import { useAppContext } from '../AppContext';
import SummarisationList from '../components/display/SummarisationList';
import SummarisationTree from '../components/display/SummarisationTree';
import { IconButton } from '@chakra-ui/react'

const HomeHeader = styled.div`
    display: flex;
    flex-direction: row;
    gap: 5px;
`

const HomeBody = styled.div`
    display: flex:
    flex-direction: column;
`

const HomePage = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
`

export default function Home({ notebookTree }) {
    const { toggleView, setToggleView } = useAppContext();

    const setListView = () => {
        setToggleView('list');
    }

    const setTreeView = () => {
        setToggleView('tree');
    }

    return (
        <HomePage>
            <HomeHeader>
            <IconButton
                variant={toggleView === 'list' ? 'solid' : 'outline'}
                colorScheme={toggleView === 'list' ? 'blue' : 'gray'}
                aria-label='Display list view'
                size='sm'
                icon={<IoList />}
                onClick={setListView}
            />
            <IconButton
                variant={toggleView === 'tree' ? 'solid' : 'outline'}
                colorScheme={toggleView === 'tree' ? 'blue' : 'gray'}
                aria-label='Display tree view'
                size='sm'
                icon={<LuFolderTree />}
                onClick={setTreeView}
            />
            </HomeHeader>
            <HomeBody>
                {
                    toggleView === "list" ? (
                        <SummarisationList notebookTree={notebookTree} />
                    ) :
                    (
                        <SummarisationTree notebookTree={notebookTree} />
                    )
                }
            </HomeBody>
        </HomePage>
    )
}