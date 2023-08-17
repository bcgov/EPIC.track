import React, { Dispatch, SetStateAction, createContext } from "react";
import { useSearchParams } from "../../hooks/SearchParams";
import workService from "../../services/workService/workService";
import { Work } from "../../models/work";

interface WorkplanContextProps {
  selectedPhaseId?: number;
  setSelectedPhaseId: Dispatch<SetStateAction<number | undefined>>;
  loading: boolean;
  work: Work | undefined;
}
interface WorkPlanContainerRouteParams extends URLSearchParams {
  work_id: string;
}
export const WorkplanContext = createContext<WorkplanContextProps>({
  selectedPhaseId: undefined,
  setSelectedPhaseId: () => ({}),
  loading: true,
  work: undefined,
});

export const WorkplanProvider = ({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}) => {
  const [selectedPhaseId, setSelectedPhaseId] = React.useState<
    number | undefined
  >();
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
  return (
    <WorkplanContext.Provider
      value={{
        selectedPhaseId,
        setSelectedPhaseId,
        loading,
        work,
      }}
    >
      {children}
    </WorkplanContext.Provider>
  );
};
