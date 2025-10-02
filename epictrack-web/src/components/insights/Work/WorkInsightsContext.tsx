import React, { createContext, useContext, useState } from "react";
import { ColumnFilter } from "components/shared/MasterTrackTable/type";

type WorkInsightsContextState = {};

const WorkInsightsContext = createContext<WorkInsightsContextState>({});

type WorkInsightsContextProviderProps = {
  children: React.ReactNode;
};
const WorkInsightsContextProvider: React.FC<
  WorkInsightsContextProviderProps
> = ({ children }) => {
  return (
    <WorkInsightsContext.Provider value={{}}>
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
