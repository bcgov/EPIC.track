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
  setTeam: Dispatch<SetStateAction<StaffWorkRole[]>>;
  work: Work | undefined;
}
interface WorkPlanContainerRouteParams extends URLSearchParams {
  work_id: string;
}
export const WorkplanContext = createContext<WorkplanContextProps>({
  selectedWorkPhase: undefined,
  setSelectedWorkPhase: () => ({}),
  setTeam: () => ({}),
  loading: true,
  team: [],
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
  const workId = React.useMemo(() => query.get("work_id"), [query]);
  React.useEffect(() => {
    getWorkById();
    getWorkTeamMembers();
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
  return (
    <WorkplanContext.Provider
      value={{
        selectedWorkPhase,
        setSelectedWorkPhase,
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
