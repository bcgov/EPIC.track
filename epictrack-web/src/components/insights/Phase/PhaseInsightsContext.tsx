import { WorkPhaseInsight } from "models/work";
import React, { createContext, useContext, useMemo, useState } from "react";
import { useGetWorkPhasesQuery } from "services/rtkQuery/phaseInsights";
import { useInsightsContext } from "../InsightsContext";

interface PhaseInsightsContextState {
  workPhases: WorkPhaseInsight[];
  loadingWorkPhases: boolean;
  viewUnderage: boolean;
  setViewUnderage: React.Dispatch<React.SetStateAction<boolean>>;
}

export const PhaseInsightsContext = createContext<
  PhaseInsightsContextState | undefined
>(undefined);

type PhaseInsightsContextProviderProps = {
  children: React.ReactNode;
};

export const PhaseInsightsContextProvider: React.FC<
  PhaseInsightsContextProviderProps
> = ({ children }) => {
  const { isUserInsights, staffId } = useInsightsContext();

  const [viewUnderage, setViewUnderage] = useState(false);

  const queryArg = useMemo(
    () => ({
      staffId: isUserInsights ? staffId : undefined,
      viewUnderage,
    }),
    [isUserInsights, staffId, viewUnderage],
  );

  const { data: workPhasesData, isLoading: loadingWorkPhases } =
    useGetWorkPhasesQuery(queryArg, {
      refetchOnMountOrArgChange: true,
    });

  const contextValue = useMemo(
    () => ({
      workPhases: workPhasesData ?? [],
      loadingWorkPhases,
      viewUnderage,
      setViewUnderage,
    }),
    [workPhasesData, loadingWorkPhases, viewUnderage],
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
      "usePhaseInsightsContext must be used within a PhaseInsightsContextProvider",
    );
  }
  return context;
};
