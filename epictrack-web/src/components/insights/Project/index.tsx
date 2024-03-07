import React from "react";
import { ProjectsContextProvider } from "./ProjectsContext";
import ProjectAccordion from "./Accordion";

const ProjectInsights = () => {
  return (
    <ProjectsContextProvider>
      <ProjectAccordion />
    </ProjectsContextProvider>
  );
};

export default ProjectInsights;
