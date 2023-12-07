import { createContext, useEffect, useState } from "react";
import { WorkPlan } from "../../models/workplan";
import workplanService from "../../services/workplanService";

interface MyWorkplanContextProps {
  workplans: WorkPlan[];
  loadingWorkplans: boolean;
  loadMoreWorkplans: () => void;
}

export const MyWorkplansContext = createContext<MyWorkplanContextProps>({
  workplans: [],
  loadingWorkplans: false,
  loadMoreWorkplans: () => {
    return;
  },
});

export const MyWorkplansProvider = ({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}) => {
  const [loadingWorkplans, setLoadingWorkplans] = useState<boolean>(true);
  const [workplans, setWorkplans] = useState<WorkPlan[]>([]);
  const [page, setPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(6);

  const loadWorkplans = async (page: number) => {
    try {
      const result = await workplanService.getAll(page, perPage);
      const newWorkplans = [...workplans, ...(result.data as any).items];
      setWorkplans(newWorkplans);
      setLoadingWorkplans(false);
    } catch (error) {
      console.log(error);
    }
  };

  const loadMoreWorkplans = () => {
    setLoadingWorkplans(true);
    setPage(page + 1);
  };

  useEffect(() => {
    if (loadingWorkplans) loadWorkplans(page);
  }, [page]);

  return (
    <MyWorkplansContext.Provider
      value={{ workplans, loadingWorkplans, loadMoreWorkplans }}
    >
      {children}
    </MyWorkplansContext.Provider>
  );
};
