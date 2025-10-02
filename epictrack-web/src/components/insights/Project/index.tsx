import { ProjectsContextProvider } from "./ProjectsContext";
import ProjectInsightsContainer from "./Accordion";

const ProjectInsights = () => {
  return (
    <ProjectsContextProvider>
      <ProjectInsightsContainer />
    </ProjectsContextProvider>
  );
};

export default ProjectInsights;
