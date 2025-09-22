import React, { createContext, useContext, useState } from "react";
import { ColumnFilter } from "components/shared/MasterTrackTable/type";

type WorkInsightsContextState = {
  columnFilters: ColumnFilter[];
  setColumnFilters: any;
};
const WorkInsightsContext = createContext<WorkInsightsContextState>({
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
  const [columnFilters, setColumnFilters] = useState<ColumnFilter[]>([]);

  return (
    <WorkInsightsContext.Provider
      value={{
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
