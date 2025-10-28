import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { INSIGHTS_TAB, InsightsTab } from "./constants";
import { useAppSelector } from "hooks";
import { workService } from "services/workService/workService";

interface InsightsContextState {
  activeTab: InsightsTab;
  setActiveTab: (tab: InsightsTab) => void;
  isUserInsights: boolean;
  setIsUserInsights: (isUser: boolean) => void;
  isUserAssignedToWork: boolean;
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
  isUserAssignedToWork: false,
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
  const [isUserAssignedToWork, setIsUserAssignedToWork] =
    useState<boolean>(false);
  const user = useAppSelector((state) => state.user.userDetail);
  const staffId = user?.staffId || undefined;

  useEffect(() => {
    const fetchStaffWorks = async () => {
      if (staffId) {
        try {
          const response = await workService.getWorkIdsByStaff(staffId);
          setIsUserAssignedToWork(response.data && response.data.length > 0);
        } catch (error) {
          console.error("Error fetching Staff's works:", error);
          setIsUserAssignedToWork(false);
        }
      } else {
        setIsUserAssignedToWork(false);
      }
    };
    fetchStaffWorks();
  }, [staffId]);

  const contextValue = useMemo(
    () => ({
      activeTab,
      setActiveTab,
      isUserInsights,
      setIsUserInsights,
      isUserAssignedToWork,
      staffId,
    }),
    [activeTab, isUserInsights, staffId, isUserAssignedToWork],
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
