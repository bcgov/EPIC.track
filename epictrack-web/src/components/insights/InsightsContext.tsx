import React, { createContext, useContext, useMemo, useState } from "react";
import { INSIGHTS_TAB, InsightsTab } from "./constants";
import { useAppSelector } from "hooks";

interface InsightsContextState {
  activeTab: InsightsTab;
  setActiveTab: (tab: InsightsTab) => void;
  isUserInsights: boolean;
  setIsUserInsights: (isUser: boolean) => void;
  staffId?: number;
}

export const InsightsContext = createContext<InsightsContextState | undefined>({
  activeTab: INSIGHTS_TAB.Work,
  setActiveTab: () => {
    return;
  },
  isUserInsights: false,
  setIsUserInsights: () => {
    return;
  },
  staffId: undefined,
});

type InsightsContextProviderProps = {
  children: React.ReactNode;
};
export const InsightsContextProvider: React.FC<
  InsightsContextProviderProps
> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<InsightsTab>(INSIGHTS_TAB.Work);
  const [isUserInsights, setIsUserInsights] = useState<boolean>(false);
  const user = useAppSelector((state) => state.user.userDetail);
  const staffId = user?.staffId || undefined;

  const contextValue = useMemo(
    () => ({
      activeTab,
      setActiveTab,
      isUserInsights,
      setIsUserInsights,
      staffId,
    }),
    [activeTab, isUserInsights, staffId]
  );

  return (
    <InsightsContext.Provider value={contextValue}>
      {children}
    </InsightsContext.Provider>
  );
};

export const useInsightsContext = () => {
  const context = useContext(InsightsContext);
  if (!context) {
    throw new Error(
      "useInsightsContext must be used within an InsightsContextProvider",
    );
  }
  return context;
};
