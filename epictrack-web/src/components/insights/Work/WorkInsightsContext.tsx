import React, { createContext, useContext, useEffect, useState } from "react";
import { WORK_INSIGHTS_TAB, WorkInsightsTab } from "./constants";
import { ColumnFilter } from "components/shared/MasterTrackTable/type";

type WorkInsightsContextState = {
  activeTab: WorkInsightsTab;
  setActiveTab: (tab: WorkInsightsTab) => void;
  columnFilters: ColumnFilter[];
  setColumnFilters: any;
};
const WorkInsightsContext = createContext<WorkInsightsContextState>({
  activeTab: WORK_INSIGHTS_TAB.Staff,
  setActiveTab: () => {
    return;
  },
  columnFilters: [],
  setColumnFilters: () => {
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
    WORK_INSIGHTS_TAB.General
  );
  const [columnFilters, setColumnFilters] = useState<ColumnFilter[]>([]);

  useEffect(() => {
    setColumnFilters([]);
  }, [activeTab]);

  return (
    <WorkInsightsContext.Provider
      value={{
        activeTab,
        setActiveTab,
        columnFilters,
        setColumnFilters,
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
