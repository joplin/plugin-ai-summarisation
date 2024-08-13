import * as React from "react";
import styled from "styled-components";
import { FaRobot } from "react-icons/fa";

const MainTitle = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 3px;
  font-size: 28px;
  font-weight: 600;
`;

export default function MainHeader() {
  return (
    <div className="main-header">
      <MainTitle>
        <FaRobot />
        Summarise Your Notes!
      </MainTitle>
    </div>
  );
}
