import * as React from "react";
import styled from "styled-components";

const MainTitle = styled.h1`
  font-size: 28px;
  font-weight: 600;
`

export default function MainHeader() {
  return (
    <div>
      <MainTitle>Summarize your notes with Joplin AI</MainTitle>
    </div>
  );
}
