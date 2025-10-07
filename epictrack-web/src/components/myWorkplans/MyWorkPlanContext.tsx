import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { WorkPlan } from "models/workplan";
import { StalenessSettings } from "models/settings";
import { workplanService } from "services/workplanService";
import stalenessSettingsService from "services/stalenessSettingsService";
import { WORK_STATE } from "../shared/constants";
import { useAppSelector } from "../../hooks";
import { showNotification } from "components/shared/notificationProvider";
import { COMMON_ERROR_MESSAGE } from "constants/application-constant";
import { MY_WORKPLAN_VIEW, MyWorkPlanView } from "./type";
import { MY_WORKPLAN_CACHED_SEARCH_OPTIONS } from "./constants";
import { useCachedState } from "hooks/useCachedFilters";

interface MyWorkplanContextProps {
  workplans: WorkPlan[];
  loadingWorkplans: boolean;
  lazyLoadMoreWorkplans: () => any;
  totalWorkplans: number;
  searchOptions: WorkPlanSearchOptions;
  setSearchOptions: React.Dispatch<React.SetStateAction<WorkPlanSearchOptions>>;
  statusStalenessSettings: StalenessSettings | undefined;
  loadingMoreWorkplans: boolean;
  setLoadingMoreWorkplans: React.Dispatch<React.SetStateAction<boolean>>;
  myWorkPlanView: MyWorkPlanView;
  setMyWorkPlanView: React.Dispatch<React.SetStateAction<MyWorkPlanView>>;
  sortOrder: string;
  setSortOrder: React.Dispatch<React.SetStateAction<string>>;
}
export type WorkPlanFilters = {
  teams: string[];
  work_states: string[];
  regions: string[];
  project_types: string[];
  work_types: string[];
  text: string;
};

export type WorkPlanSearchOptions = WorkPlanFilters & {
  staff_id: number | null;
};

// used in WorkStateFilter as default value for the Filter Select
export const DEFAULT_WORK_STATE = WORK_STATE.IN_PROGRESS;

export const workplanDefaultFilters: WorkPlanFilters = {
  teams: [],
  work_states: [DEFAULT_WORK_STATE.value],
  regions: [],
  project_types: [],
  work_types: [],
  text: "",
};
export const defaultSearchOptions: WorkPlanSearchOptions = {
  ...workplanDefaultFilters,
  staff_id: null,
};

export const MyWorkplansContext = createContext<MyWorkplanContextProps>({
  workplans: [],
  loadingWorkplans: false,
  lazyLoadMoreWorkplans: () => {
    return;
  },
  totalWorkplans: 0,
  searchOptions: defaultSearchOptions,
  setSearchOptions: () => {
    return;
  },
  statusStalenessSettings: undefined,
  loadingMoreWorkplans: false,
  setLoadingMoreWorkplans: () => {
    return;
  },
  myWorkPlanView: MY_WORKPLAN_VIEW.CARDS,
  setMyWorkPlanView: () => {
    return;
  },
  sortOrder: "desc",
  setSortOrder: () => {
    return;
  },
});

const PAGE_SIZE = 12;

export const MyWorkplansProvider = ({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}) => {
  const user = useAppSelector((state) => state.user.userDetail);
  const [loadingWorkplans, setLoadingWorkplans] = useState<boolean>(true);
  const [loadingMoreWorkplans, setLoadingMoreWorkplans] =
    useState<boolean>(false);
  const [statusStalenessSettings, setStatusStalenessSettings] =
    useState<StalenessSettings>();
  const [workplans, setWorkplans] = useState<WorkPlan[]>([]);
  const [totalWorkplans, setTotalWorkplans] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [sortOrder, setSortOrder] = useState<string>("desc");

  const [searchOptions, setSearchOptions] = useCachedState(
    MY_WORKPLAN_CACHED_SEARCH_OPTIONS,
    {
      ...defaultSearchOptions,
      staff_id: user?.staffId || null,
    },
  );

  const [myWorkPlanView, setMyWorkPlanView] = useState<MyWorkPlanView>(
    MY_WORKPLAN_VIEW.CARDS,
  );

  const fetchWorkplans = useCallback(
    async (page: number, shouldAppend = false) => {
      try {
        const result = await workplanService.getAll(
          page,
          PAGE_SIZE,
          sortOrder,
          searchOptions,
        );
        if (!result || !result.data) {
          setWorkplans([]);
          setTotalWorkplans(0);
          setLoadingWorkplans(false);
          showNotification("Failed to load Workplans", {
            type: "error",
            duration: 3000,
          });
          return;
        }
        setPage(page);
        setWorkplans((prev) =>
          shouldAppend
            ? [...prev, ...result.data.items]
            : [...result.data.items],
        );
        setTotalWorkplans(result.data.total);
        setLoadingWorkplans(false);
      } catch (error) {
        showNotification(COMMON_ERROR_MESSAGE, {
          type: "error",
        });
      }
    },
    [searchOptions, sortOrder],
  );

  const getStalenessSettings = useCallback(async () => {
    try {
      const statusStalenessSetting =
        await stalenessSettingsService.getStatusStaleness();
      setStatusStalenessSettings(statusStalenessSetting.data);
    } catch (error) {
      showNotification("Could not load Staleness settings", {
        duration: 3000,
        type: "error",
      });
    }
  }, []);

  useEffect(() => {
    getStalenessSettings();
  }, [getStalenessSettings]);

  const lazyLoadMoreWorkplans = useCallback(async () => {
    setLoadingMoreWorkplans(true);
    await fetchWorkplans(page + 1, true);
    setLoadingMoreWorkplans(false);
  }, [fetchWorkplans, page]);

  useEffect(() => {
    const loadWorkplans = async () => {
      setLoadingWorkplans(true);
      await fetchWorkplans(1);
      setLoadingWorkplans(false);
    };
    loadWorkplans();
  }, [fetchWorkplans, searchOptions]);

  const contextValue = useMemo(
    () => ({
      workplans,
      loadingWorkplans,
      lazyLoadMoreWorkplans,
      totalWorkplans,
      searchOptions,
      setSearchOptions,
      loadingMoreWorkplans,
      setLoadingMoreWorkplans,
      statusStalenessSettings,
      myWorkPlanView,
      setMyWorkPlanView,
      sortOrder,
      setSortOrder,
    }),
    [
      workplans,
      loadingWorkplans,
      lazyLoadMoreWorkplans,
      totalWorkplans,
      searchOptions,
      setSearchOptions,
      loadingMoreWorkplans,
      setLoadingMoreWorkplans,
      statusStalenessSettings,
      myWorkPlanView,
      setMyWorkPlanView,
      sortOrder,
      setSortOrder,
    ],
  );

  return (
    <MyWorkplansContext.Provider value={contextValue}>
      {children}
    </MyWorkplansContext.Provider>
  );
};
