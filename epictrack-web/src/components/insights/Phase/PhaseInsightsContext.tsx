import { Work, WorkPhase, WorkPhaseAdditionalInfo } from "models/work";
import React, { createContext, useContext, useMemo } from "react";
import { useGetWorkPhasesQuery } from "services/rtkQuery/phaseInsights";
import { useInsightsContext } from "../InsightsContext";

interface PhaseInsightsContextState {
  workPhases: ({ work: Work } & WorkPhase & WorkPhaseAdditionalInfo)[];
  loadingWorkPhases: boolean;
}

export const PhaseInsightsContext = createContext<
  PhaseInsightsContextState | undefined
>({
  workPhases: [],
  loadingWorkPhases: false,
});

type PhaseInsightsContextProviderProps = {
  children: React.ReactNode;
};
export const PhaseInsightsContextProvider: React.FC<
  PhaseInsightsContextProviderProps
> = ({ children }) => {
  const { isUserInsights, staffId } = useInsightsContext();

  const queryArg = useMemo(
    () => ({ legislated: true, staffId: isUserInsights ? staffId : undefined }),
    [isUserInsights, staffId]
  );

  const { data: workPhasesData, isLoading: loadingWorkPhases } =
    useGetWorkPhasesQuery(queryArg, {
      refetchOnMountOrArgChange: true,
    });

  console.log(workPhasesData?.length);

  const contextValue = useMemo(
    () => ({
      workPhases: workPhasesData ?? [],
      loadingWorkPhases,
    }),
    [workPhasesData, loadingWorkPhases]
  );
  return (
    <PhaseInsightsContext.Provider value={contextValue}>
      {children}
    </PhaseInsightsContext.Provider>
  );
};

export const usePhaseInsightsContext = () => {
  const context = useContext(PhaseInsightsContext);
  if (!context) {
    throw new Error(
      "usePhaseInsightsContext must be used within a PhaseInsightsContextProvider"
    );
  }
  return context;
};
