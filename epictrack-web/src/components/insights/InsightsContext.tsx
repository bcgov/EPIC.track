import React, { createContext, useContext } from "react";

interface InsightsContextState {
  state?: any;
}

export const InsightsContext = createContext<InsightsContextState | undefined>(
  undefined
);

type InsightsContextProviderProps = {
  children: React.ReactNode;
};
export const InsightsContextProvider: React.FC<
  InsightsContextProviderProps
> = ({ children }) => {
  return (
    <InsightsContext.Provider value={{}}>{children}</InsightsContext.Provider>
  );
};

export const useInsightsContext = () => {
  const context = useContext(InsightsContext);
  if (!context) {
    throw new Error(
      "useInsightsContext must be used within an InsightsContextProvider"
    );
  }
  return context;
};
