import React, { createContext, useContext, useState } from "react";
import { INSIGHTS_TAB, InsightsTab } from "./constants";

interface InsightsContextState {
  activeTab: InsightsTab;
  setActiveTab: (tab: InsightsTab) => void;
}

export const InsightsContext = createContext<InsightsContextState | undefined>({
  activeTab: INSIGHTS_TAB.Work,
  setActiveTab: () => {
    return;
  },
});

type InsightsContextProviderProps = {
  children: React.ReactNode;
};
export const InsightsContextProvider: React.FC<
  InsightsContextProviderProps
> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<InsightsTab>(INSIGHTS_TAB.Work);
  return (
    <InsightsContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </InsightsContext.Provider>
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
