import { createContext, useEffect, useState } from "react";
import { WorkPlan } from "../../models/workplan";
import workplanService from "../../services/workplanService";

interface MyWorkplanContextProps {
  workplans: WorkPlan[];
  loadingWorkplans: boolean;
  lazyLoadMoreWorkplans: () => any;
  totalWorkplans: number;
  setSearchOptions: React.Dispatch<React.SetStateAction<WorkPlanSearchOptions>>;
  loadingMoreWorkplans?: boolean;
}

export const MyWorkplansContext = createContext<MyWorkplanContextProps>({
  workplans: [],
  loadingWorkplans: false,
  lazyLoadMoreWorkplans: () => {
    return;
  },
  totalWorkplans: 0,
  setSearchOptions: () => {
    return;
  },
  loadingMoreWorkplans: false,
});

export interface WorkPlanSearchOptions {
  teams: string[];
  work_states: string[];
  regions: string[];
  project_types: string[];
  work_types: string[];
  text: string;
  staff_id: number | null;
}

const PAGE_SIZE = 6;
export const MyWorkplansProvider = ({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}) => {
  const [loadingWorkplans, setLoadingWorkplans] = useState<boolean>(true);
  const [loadingMoreWorkplans, setLoadingMoreWorkplans] =
    useState<boolean>(false);
  const [workplans, setWorkplans] = useState<WorkPlan[]>([]);
  const [totalWorkplans, setTotalWorkplans] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [searchOptions, setSearchOptions] = useState<WorkPlanSearchOptions>({
    teams: [],
    work_states: [],
    regions: [],
    project_types: [],
    work_types: [],
    text: "",
    staff_id: null,
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

  return (
    <MyWorkplansContext.Provider
      value={{
        workplans,
        loadingWorkplans,
        lazyLoadMoreWorkplans,
        totalWorkplans,
        setSearchOptions,
        loadingMoreWorkplans,
      }}
    >
      {children}
    </MyWorkplansContext.Provider>
  );
};
