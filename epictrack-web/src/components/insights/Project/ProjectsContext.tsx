import { Project } from "models/project";
import { createContext, useContext, useMemo } from "react";
import { useGetProjectsQuery } from "services/rtkQuery/projectInsights";
import { useInsightsContext } from "../InsightsContext";

interface ProjectsContextState {
  projects: Project[];
  loadingProjects: boolean;
}

export const ProjectsContext = createContext<ProjectsContextState | undefined>({
  projects: [],
  loadingProjects: false,
});

type ProjectsContextProviderProps = {
  children: React.ReactNode;
};
export const ProjectsContextProvider: React.FC<
  ProjectsContextProviderProps
> = ({ children }) => {
  const { isUserInsights, staffId } = useInsightsContext();

  const queryArg = useMemo(
    () => ({ staffId: isUserInsights ? staffId : undefined }),
    [isUserInsights, staffId],
  );

  const { data: projectsData, isLoading: loadingProjects } =
    useGetProjectsQuery(queryArg, {
      refetchOnMountOrArgChange: true,
    });

  const contextValue = useMemo(
    () => ({
      projects: projectsData ?? [],
      loadingProjects,
    }),
    [projectsData, loadingProjects],
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
      "useProjectsContext must be used within an ProjectsContextProvider",
    );
  }
  return context;
};
