import { Project } from "models/project";
import React, { createContext, useContext, useMemo } from "react";
import { useGetProjectsQuery } from "services/rtkQuery/projectInsights";

interface ProjectsContextState {
  projects: Project[];
  loadingProjects: boolean;
}

export const ProjectsContext = createContext<ProjectsContextState | undefined>(
  undefined
);

type ProjectsContextProviderProps = {
  children: React.ReactNode;
};
export const ProjectsContextProvider: React.FC<
  ProjectsContextProviderProps
> = ({ children }) => {
  const { data: projectsData, isLoading: loadingProjects } =
    useGetProjectsQuery();

  const contextValue = useMemo(
    () => ({
      projects: projectsData ?? [],
      loadingProjects,
    }),
    [projectsData, loadingProjects]
  );
  return (
    <ProjectsContext.Provider value={contextValue}>
      {children}
    </ProjectsContext.Provider>
  );
};

export const useProjectsContext = () => {
  const context = useContext(ProjectsContext);
  if (!context) {
    throw new Error(
      "useProjectsContext must be used within an ProjectsContextProvider"
    );
  }
  return context;
};
