import { createContext, useEffect, useMemo, useState } from "react";
import { WorkPlan } from "../../models/workplan";
import workplanService from "../../services/workplanService";
import { WORK_STATE } from "../shared/constants";
import { useAppSelector } from "../../hooks";
import { showNotification } from "components/shared/notificationProvider";
import { COMMON_ERROR_MESSAGE } from "constants/application-constant";
import { MY_WORKPLAN_VIEW, MyWorkPlanView } from "./type";
import {
  MY_WORKLAN_FILTERS,
  MY_WORKPLAN_CACHED_SEARCH_OPTIONS,
} from "./constants";
import { useCachedState } from "hooks/useCachedFilters";

interface MyWorkplanContextProps {
  workplans: WorkPlan[];
  loadingWorkplans: boolean;
  lazyLoadMoreWorkplans: () => any;
  totalWorkplans: number;
  searchOptions: WorkPlanSearchOptions;
  setSearchOptions: React.Dispatch<React.SetStateAction<WorkPlanSearchOptions>>;
  loadingMoreWorkplans: boolean;
  setLoadingMoreWorkplans: React.Dispatch<React.SetStateAction<boolean>>;
  myWorkPlanView: MyWorkPlanView;
  setMyWorkPlanView: React.Dispatch<React.SetStateAction<MyWorkPlanView>>;
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
  loadingMoreWorkplans: false,
  setLoadingMoreWorkplans: () => {
    return;
  },
  myWorkPlanView: MY_WORKPLAN_VIEW.CARDS,
  setMyWorkPlanView: () => {
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
  const [workplans, setWorkplans] = useState<WorkPlan[]>([]);
  const [totalWorkplans, setTotalWorkplans] = useState<number>(0);
  const [page, setPage] = useState<number>(1);

  const [searchOptions, setSearchOptions] = useCachedState(
    MY_WORKPLAN_CACHED_SEARCH_OPTIONS,
    {
      ...defaultSearchOptions,
      staff_id: user?.staffId || null,
    }
  );

  const [myWorkPlanView, setMyWorkPlanView] = useState<MyWorkPlanView>(
    MY_WORKPLAN_VIEW.CARDS
  );

  const fetchWorkplans = async (page: number, shouldAppend = false) => {
    try {
      const result = await workplanService.getAll(
        page,
        PAGE_SIZE,
        searchOptions
      );
      let newWorkplans;
      if (shouldAppend) {
        newWorkplans = [...workplans, ...result.data.items];
      } else {
        newWorkplans = [...result.data.items];
      }
      setPage(page);
      setWorkplans(newWorkplans);
      setTotalWorkplans(result.data.total);
      setLoadingWorkplans(false);
    } catch (error) {
      showNotification(COMMON_ERROR_MESSAGE, {
        type: "error",
      });
    }
  };

  const loadWorkplans = async () => {
    setLoadingWorkplans(true);
    await fetchWorkplans(1);
    setLoadingWorkplans(false);
  };

  const lazyLoadMoreWorkplans = async () => {
    setLoadingMoreWorkplans(true);
    await fetchWorkplans(page + 1, true);
    setLoadingMoreWorkplans(false);
  };

  useEffect(() => {
    loadWorkplans();
  }, [searchOptions]);

  useEffect(() => {
    if (loadingMoreWorkplans) {
      lazyLoadMoreWorkplans();
    }
  }, [loadingMoreWorkplans]);

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
      myWorkPlanView,
      setMyWorkPlanView,
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
      myWorkPlanView,
      setMyWorkPlanView,
    ]
  );

  return (
    <MyWorkplansContext.Provider value={contextValue}>
      {children}
    </MyWorkplansContext.Provider>
  );
};
