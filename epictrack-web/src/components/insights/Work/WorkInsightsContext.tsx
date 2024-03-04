import React, { createContext, useContext, useState } from "react";
import { WORK_INSIGHTS_TAB, WorkInsightsTab } from "./constants";

type WorkInsightsContextState = {
  activeTab: WorkInsightsTab;
  setActiveTab: (tab: WorkInsightsTab) => void;
};
const WorkInsightsContext = createContext<WorkInsightsContextState>({
  activeTab: WORK_INSIGHTS_TAB.Staff,
  setActiveTab: () => {
    return;
  },
});

type WorkInsightsContextProviderProps = {
  children: React.ReactNode;
};
const WorkInsightsContextProvider: React.FC<
  WorkInsightsContextProviderProps
> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<WorkInsightsTab>(
    WORK_INSIGHTS_TAB.Staff
  );

  return (
    <WorkInsightsContext.Provider
      value={{
        activeTab,
        setActiveTab,
      }}
    >
      {children}
    </WorkInsightsContext.Provider>
  );
};

// Create the custom hook to access the context value
const useWorkInsightsContext = () => {
  const contextValue = useContext(WorkInsightsContext);
  if (contextValue === null) {
    throw new Error("useWorkInsightsContext must be used within a MyProvider");
  }
  return contextValue;
};

export { WorkInsightsContextProvider, useWorkInsightsContext };
