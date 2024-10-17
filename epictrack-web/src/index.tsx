import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import { store } from "./store";
import { Provider } from "react-redux";
import { StyledEngineProvider, ThemeProvider } from "@mui/material/styles";
import { BaseTheme } from "./styles/theme";
// import "@bcgov/bc-sans/css/BCSans.css";

// eslint-disable-next-line
const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(
  <Provider store={store}>
    <ThemeProvider theme={BaseTheme}>
      <StyledEngineProvider injectFirst>
        <App />
      </StyledEngineProvider>
    </ThemeProvider>
  </Provider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
