import React from "react";
import { WorkInsightsContextProvider } from "./WorkInsightsContext";
import WorkAccordion from "./Accordion";

const WorkInsights = () => {
  return (
    <WorkInsightsContextProvider>
      <WorkAccordion />
    </WorkInsightsContextProvider>
  );
};

export default WorkInsights;
