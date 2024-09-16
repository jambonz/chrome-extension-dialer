import React from "react";
import ReactDOM from "react-dom/client";
import { ChakraProvider } from "@chakra-ui/react";
import mainTheme from "./theme";
import WindowApp from "./window/app";

// This file is being used only for dev.

const root = document.createElement("div");
root.className = "container";
document.body.appendChild(root);
const rootDiv = ReactDOM.createRoot(root);
rootDiv.render(
  <React.StrictMode>
    <ChakraProvider theme={mainTheme}>
      <WindowApp />
    </ChakraProvider>
  </React.StrictMode>
);
