import {
  Dispatch,
  SetStateAction,
  createContext,
  useEffect,
  useState,
  useMemo,
} from "react";
import { useSearchParams } from "../../hooks/SearchParams";
import workService from "../../services/workService/workService";
import { Work, WorkPhaseAdditionalInfo } from "../../models/work";
import { StaffWorkRole } from "../../models/staff";
import {
  ACTIVE_STATUS,
  COMMON_ERROR_MESSAGE,
} from "../../constants/application-constant";
import { showNotification } from "../shared/notificationProvider";
import { WorkFirstNation } from "../../models/firstNation";
import { Status } from "../../models/status";
import { WorkIssue } from "../../models/Issue";
import statusService from "../../services/statusService/statusService";
import dateUtils from "../../utils/dateUtils";
import moment from "moment";

interface WorkplanContextProps {
  selectedWorkPhase?: WorkPhaseAdditionalInfo;
  setSelectedWorkPhase: Dispatch<
    SetStateAction<WorkPhaseAdditionalInfo | undefined>
  >;
  loading: boolean;
  team: StaffWorkRole[];
  workPhases: WorkPhaseAdditionalInfo[];
  setTeam: Dispatch<SetStateAction<StaffWorkRole[]>>;
  setWorkPhases: Dispatch<SetStateAction<WorkPhaseAdditionalInfo[]>>;
  work: Work | undefined;
  setWork: Dispatch<SetStateAction<Work | undefined>>;
  firstNations: WorkFirstNation[];
  setFirstNations: Dispatch<SetStateAction<WorkFirstNation[]>>;
  statuses: Status[];
  setStatuses: Dispatch<SetStateAction<Status[]>>;
  getWorkStatuses: () => Promise<void>;
  issues: WorkIssue[];
  setIssues: Dispatch<SetStateAction<WorkIssue[]>>;
  isStatusOutOfDate: () => boolean;
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
  setWork: () => ({}),
  firstNations: [],
  setFirstNations: () => ({}),
  statuses: [],
  setStatuses: () => ({}),
  issues: [],
  setIssues: () => ({}),
  getWorkStatuses: () => new Promise((resolve) => resolve),
  isStatusOutOfDate: () => false,
});

export const WorkplanProvider = ({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}) => {
  const [selectedWorkPhase, setSelectedWorkPhase] =
    useState<WorkPhaseAdditionalInfo>();
  const [work, setWork] = useState<Work>();
  const [team, setTeam] = useState<StaffWorkRole[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const query = useSearchParams<WorkPlanContainerRouteParams>();
  const [workPhases, setWorkPhases] = useState<WorkPhaseAdditionalInfo[]>([]);
  const [firstNations, setFirstNations] = useState<WorkFirstNation[]>([]);
  const workId = useMemo(() => query.get("work_id"), [query]);

  const [issues, setIssues] = useState<WorkIssue[]>([]);

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

  useEffect(() => {
    loadData();
  }, [workId]);

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
      setWorkPhases(workPhasesResult.data as WorkPhaseAdditionalInfo[]);
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
    if (workId) {
      const statusResult = await statusService.getAll(Number(workId));
      if (statusResult.status === 200) {
        setStatuses(statusResult.data);
        return Promise.resolve();
      }
    }
  };

  const STATUS_DATE_THRESHOLD = 7;

  const isStatusOutOfDate = () => {
    const lastApprovedStatus = statuses.find((status) => status.is_approved);

    if (!lastApprovedStatus) {
      return false;
    }

    const daysAgo = moment().subtract(STATUS_DATE_THRESHOLD, "days");
    const NDaysAgo = dateUtils.diff(
      daysAgo.toLocaleString(),
      lastApprovedStatus?.posted_date,
      "days"
    );

    return NDaysAgo > 0;
  };

  return (
    <WorkplanContext.Provider
      value={{
        setStatuses,
        getWorkStatuses,
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
        isStatusOutOfDate,
      }}
    >
      {children}
    </WorkplanContext.Provider>
  );
};
