import React from "react";
import ReactDOM from "react-dom/client";

import App from './App';
import { BrowserRouter } from "react-router-dom";

import "./index.css"; // Our global styles
import { lightTheme as theme } from './theme';
import { ThemeProvider } from "@mui/material/styles";

/**
 * The root element
 */
const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);

/**
 * Render the app
 */
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <BrowserRouter>
          <App />
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>,
);
