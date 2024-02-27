import React from "react";
import { InsightsContextProvider } from "./InsightsContext";
import Main from "./main";

const Insights = () => {
  return (
    <InsightsContextProvider>
      <Main />
    </InsightsContextProvider>
  );
};

export default Insights;
