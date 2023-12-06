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

  const loadWorkplans = async (page: number) => {
    if (!loadingWorkplans) {
      setLoadingWorkplans(true);
    }

    try {
      const result = await workplanService.getAll(page);
      const newWorkplans = [...workplans, ...(result.data as any).items];
      const filteredWorkplans = newWorkplans.filter(
        (value: any, index: any, self: any) => {
          return index === self.findIndex((t: any) => t.id === value.id); // Prevent same work being in list twice
        }
      );
      setWorkplans(filteredWorkplans);
      console.log(workplans);
      setLoadingWorkplans(false);
    } catch (error) {
      console.log(error);
    }
  };

  const loadMoreWorkplans = () => {
    setPage((prevPage) => prevPage + 1);
  };

  useEffect(() => {
    loadWorkplans(page);
  }, [page]);

  return (
    <MyWorkplansContext.Provider
      value={{ workplans, loadingWorkplans, loadMoreWorkplans }}
    >
      {children}
    </MyWorkplansContext.Provider>
  );
};
