import React, { Dispatch, SetStateAction, createContext } from "react";
import { useSearchParams } from "../../hooks/SearchParams";
import workService from "../../services/workService/workService";
import { Work, WorkPhase } from "../../models/work";
import { StaffWorkRole } from "../../models/staff";
import {
  ACTIVE_STATUS,
  COMMON_ERROR_MESSAGE,
} from "../../constants/application-constant";
import { showNotification } from "../shared/notificationProvider";

interface WorkplanContextProps {
  selectedWorkPhase?: WorkPhase;
  setSelectedWorkPhase: Dispatch<SetStateAction<WorkPhase | undefined>>;
  loading: boolean;
  team: StaffWorkRole[];
  workPhases: WorkPhase[];
  setTeam: Dispatch<SetStateAction<StaffWorkRole[]>>;
  setWorkPhases: Dispatch<SetStateAction<WorkPhase[]>>;
  work: Work | undefined;
}
interface WorkPlanContainerRouteParams extends URLSearchParams {
  work_id: string;
}
export const WorkplanContext = createContext<WorkplanContextProps>({
  selectedWorkPhase: undefined,
  setSelectedWorkPhase: () => ({}),
  setTeam: () => ({}),
  setWorkPhases: () => ({}),
  loading: true,
  team: [],
  workPhases: [],
  work: undefined,
});

export const WorkplanProvider = ({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}) => {
  const [selectedWorkPhase, setSelectedWorkPhase] = React.useState<WorkPhase>();
  const [work, setWork] = React.useState<Work>();
  const [team, setTeam] = React.useState<StaffWorkRole[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const query = useSearchParams<WorkPlanContainerRouteParams>();
  const [workPhases, setWorkPhases] = React.useState<WorkPhase[]>([]);
  const workId = React.useMemo(() => query.get("work_id"), [query]);
  React.useEffect(() => {
    getWorkById();
    getWorkTeamMembers();
    getWorkPhases();
  }, [workId]);

  const getWorkTeamMembers = React.useCallback(async () => {
    setLoading(true);
    try {
      const teamResult = await workService.getWorkTeamMembers(Number(workId));
      if (teamResult.status === 200) {
        const team = (teamResult.data as StaffWorkRole[]).map((p) => {
          return {
            ...p,
            status: p.is_active ? ACTIVE_STATUS.ACTIVE : ACTIVE_STATUS.INACTIVE,
          };
        });
        setTeam(team);
      }
    } catch (e) {
      showNotification(COMMON_ERROR_MESSAGE, {
        type: "error",
      });
    }
    setLoading(false);
  }, [workId]);

  const getWorkById = React.useCallback(async () => {
    if (workId) {
      const work = await workService.getById(String(workId));
      setWork(work.data as Work);
      setLoading(false);
    }
  }, [workId]);
  const getWorkPhases = React.useCallback(async () => {
    if (workId) {
      setLoading(true);
      const workPhasesResult = await workService.getWorkPhases(String(workId));
      setWorkPhases(workPhasesResult.data as WorkPhase[]);
      setLoading(false);
    }
  }, [workId]);
  return (
    <WorkplanContext.Provider
      value={{
        selectedWorkPhase,
        setSelectedWorkPhase,
        workPhases,
        setWorkPhases,
        loading,
        work,
        team,
        setTeam,
      }}
    >
      {children}
    </WorkplanContext.Provider>
  );
};
