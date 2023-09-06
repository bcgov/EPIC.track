import React, { Dispatch, SetStateAction, createContext } from "react";
import { useSearchParams } from "../../hooks/SearchParams";
import workService from "../../services/workService/workService";
import { Work, WorkPhaseSkeleton } from "../../models/work";

interface WorkplanContextProps {
  selectedPhase?: WorkPhaseSkeleton;
  setSelectedPhase: Dispatch<SetStateAction<WorkPhaseSkeleton | undefined>>;
  loading: boolean;
  work: Work | undefined;
}
interface WorkPlanContainerRouteParams extends URLSearchParams {
  work_id: string;
}
export const WorkplanContext = createContext<WorkplanContextProps>({
  selectedPhase: undefined,
  setSelectedPhase: () => ({}),
  loading: true,
  work: undefined,
});

export const WorkplanProvider = ({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}) => {
  const [selectedPhase, setSelectedPhase] = React.useState<WorkPhaseSkeleton>();
  const [work, setWork] = React.useState<Work>();
  const [loading, setLoading] = React.useState<boolean>(true);
  const query = useSearchParams<WorkPlanContainerRouteParams>();
  const work_id = React.useMemo(() => query.get("work_id"), [query]);
  React.useEffect(() => {
    getWorkById();
  }, [work_id]);
  const getWorkById = React.useCallback(async () => {
    if (work_id) {
      const work = await workService.getById(String(work_id));
      setWork(work.data as Work);
      setLoading(false);
    }
  }, [work_id]);
  console.log("SELECTED PHASE ", selectedPhase);
  return (
    <WorkplanContext.Provider
      value={{
        selectedPhase,
        setSelectedPhase,
        loading,
        work,
      }}
    >
      {children}
    </WorkplanContext.Provider>
  );
};
