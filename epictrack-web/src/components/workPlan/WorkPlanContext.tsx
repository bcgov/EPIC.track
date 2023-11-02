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
import { WorkFirstNation } from "../../models/firstNation";
import { Status } from "../../models/status";
import dateUtils from "../../utils/dateUtils";
import { Issue } from "../../models/Issue";

interface WorkplanContextProps {
  selectedWorkPhase?: WorkPhase;
  setSelectedWorkPhase: Dispatch<SetStateAction<WorkPhase | undefined>>;
  loading: boolean;
  team: StaffWorkRole[];
  workPhases: WorkPhase[];
  setTeam: Dispatch<SetStateAction<StaffWorkRole[]>>;
  setWorkPhases: Dispatch<SetStateAction<WorkPhase[]>>;
  work: Work | undefined;
  setWork: Dispatch<SetStateAction<Work | undefined>>;
  firstNations: WorkFirstNation[];
  setFirstNations: Dispatch<SetStateAction<WorkFirstNation[]>>;
  statuses: Status[];
  issues: Issue[];
  setIssues: Dispatch<SetStateAction<Issue[]>>;
}
interface WorkPlanContainerRouteParams extends URLSearchParams {
  work_id: string;
}

const testStatuses: Status[] = [
  {
    id: 1,
    title: "Toms Status 1",
    description: "this is the description for toms status",
    active: true,
    high_priority: false,
    start_date: "2023-12-26",
    approved: false,
  },
  {
    id: 2,
    title: "Toms Status 2",
    description:
      "The assessment was carried out through a federally appointed panel, which both levels of government are using to base their decisions about whether to approve the project to proceed.\n\n On January 23, 2023, the federal Minister of Environment and Climate Change determined that the VFPA has responded to the questions posed in the August 2020 information request in sufficient detail. The federal environmental assessment timeline of 89 days until a federal decision on RBT2 at that point resumed. This will be reached on April 23, 2023.\n\n The EAO has 30 days from that point to refer to Ministers for their decision.",
    active: true,
    high_priority: false,
    start_date: "2023-11-4",
    approved: true,
  },
  {
    id: 3,
    title: "Toms Status 3",
    description: "middle status",
    active: true,
    high_priority: false,
    start_date: "2023-12-2",
    approved: false,
  },
];

export const WorkplanContext = createContext<WorkplanContextProps>({
  selectedWorkPhase: undefined,
  setSelectedWorkPhase: () => ({}),
  setTeam: () => ({}),
  setWorkPhases: () => ({}),
  loading: true,
  team: [],
  workPhases: [],
  work: undefined,
  setWork: () => ({}),
  firstNations: [],
  setFirstNations: () => ({}),
  statuses: [],
  issues: [],
  setIssues: () => ({}),
});

export const WorkplanProvider = ({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}) => {
  const [selectedWorkPhase, setSelectedWorkPhase] = React.useState<WorkPhase>();
  const [work, setWork] = React.useState<Work>();
  const [team, setTeam] = React.useState<StaffWorkRole[]>([]);
  const [statuses, setStatuses] = React.useState<Status[]>([]);
  const [issues, setIssues] = React.useState<Issue[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const query = useSearchParams<WorkPlanContainerRouteParams>();
  const [workPhases, setWorkPhases] = React.useState<WorkPhase[]>([]);
  const [firstNations, setFirstNations] = React.useState<WorkFirstNation[]>([]);
  const workId = React.useMemo(() => query.get("work_id"), [query]);

  React.useEffect(() => {
    loadData();
  }, [workId]);

  const loadData = async () => {
    try {
      await getWorkById();
      await getWorkTeamMembers();
      await getWorkPhases();
      await getWorkFirstNations();
      await getWorkStatuses();
      setLoading(false);
    } catch (e) {
      showNotification(COMMON_ERROR_MESSAGE, {
        type: "error",
      });
      setLoading(false);
    }
  };

  const getWorkTeamMembers = async () => {
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
        return Promise.resolve();
      }
    } catch (e) {
      showNotification(COMMON_ERROR_MESSAGE, {
        type: "error",
      });
    }
  };

  const getWorkById = async () => {
    if (workId) {
      const work = await workService.getById(String(workId));
      setWork(work.data as Work);
    }
    return Promise.resolve();
  };

  const getWorkPhases = async () => {
    if (workId) {
      const workPhasesResult = await workService.getWorkPhases(String(workId));
      setWorkPhases(workPhasesResult.data as WorkPhase[]);
    }
    return Promise.resolve();
  };

  const getWorkFirstNations = async () => {
    if (workId) {
      const firstNationResult = await workService.getWorkFirstNations(
        Number(workId)
      );
      if (firstNationResult.status === 200) {
        const firstNations = (firstNationResult.data as WorkFirstNation[]).map(
          (p) => {
            return {
              ...p,
              status: p.is_active
                ? ACTIVE_STATUS.ACTIVE
                : ACTIVE_STATUS.INACTIVE,
            };
          }
        );
        setFirstNations(firstNations);
      }
    }
  };

  const getWorkStatuses = async () => {
    // if (workId) {
    //   const statusResult = await workService.getWorkStatuses(Number(workId));
    //   if (statusResult.status === 200) {
    //     setStatuses(statusResult.data as Status[]);
    //     return Promise.resolve();
    //   }
    // }
    setStatuses(
      testStatuses.sort((a, b) => {
        return dateUtils.diff(a.start_date, b.start_date, "days");
      })
    );
    return Promise.resolve();
  };

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
        firstNations,
        setFirstNations,
        setWork,
        statuses,
        issues,
        setIssues,
      }}
    >
      {children}
    </WorkplanContext.Provider>
  );
};
