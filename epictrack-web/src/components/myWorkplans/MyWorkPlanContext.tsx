import { createContext, useEffect, useMemo, useState } from "react";
import { WorkPlan } from "../../models/workplan";
import workplanService from "../../services/workplanService";
import { WORK_STATE } from "../shared/constants";
import { useAppSelector } from "../../hooks";

interface MyWorkplanContextProps {
  workplans: WorkPlan[];
  loadingWorkplans: boolean;
  lazyLoadMoreWorkplans: () => any;
  totalWorkplans: number;
  searchOptions: WorkPlanSearchOptions;
  setSearchOptions: React.Dispatch<React.SetStateAction<WorkPlanSearchOptions>>;
  loadingMoreWorkplans: boolean;
  setLoadingMoreWorkplans: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface WorkPlanSearchOptions {
  teams: string[];
  work_states: string[];
  regions: string[];
  project_types: string[];
  work_types: string[];
  text: string;
  staff_id: number | null;
}

// used in WorkStateFilter as default value for the Filter Select
export const DEFAULT_WORK_STATE = WORK_STATE.IN_PROGRESS;

const defaultSearchOptions: WorkPlanSearchOptions = {
  teams: [],
  work_states: [DEFAULT_WORK_STATE.value],
  regions: [],
  project_types: [],
  work_types: [],
  text: "",
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
});

const PAGE_SIZE = 6;

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
  const [searchOptions, setSearchOptions] = useState<WorkPlanSearchOptions>({
    ...defaultSearchOptions,
    staff_id: user.staffId,
  });

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
      console.log(error);
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
    ]
  );

  return (
    <MyWorkplansContext.Provider value={contextValue}>
      {children}
    </MyWorkplansContext.Provider>
  );
};
