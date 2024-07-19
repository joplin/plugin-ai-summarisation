import * as React from 'react';
import { useAppContext } from '../AppContext';

import styled from 'styled-components';
import { IoArrowBackCircle } from "react-icons/io5";


const BackButton = styled.div`
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 5px;
    margin-bottom: 20px;
    &:hover {
        color: #007bff;
    }
`;

export default function NoteDetailsHeader() {
    const { setView, setSelectedNoteId } = useAppContext();

    const handleBackClick = () => {
        setSelectedNoteId(null);
        setView('home');
    };

    return (
        <div>
            <BackButton onClick={handleBackClick}>
                <IoArrowBackCircle size={24} />
                <span>Back to Home</span>
            </BackButton>
            <h1>Note Details</h1>
        </div>
    );
}
