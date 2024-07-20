import * as React from "react";
import { render } from "react-dom";
import { AppProvider } from "./AppContext";
import { ChakraProvider } from '@chakra-ui/react'


import App from "./app";

function Root() {
  return (
    <ChakraProvider>
      <AppProvider>
        <App />
      </AppProvider>
    </ChakraProvider>
  );
}

render(<Root />, document.getElementById("root"));
