import {
  createContext,
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSearchParams } from "../../hooks/useSearchParams";
import { workService } from "../../services/workService/workService";
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
import { StalenessSettings } from "models/settings";
import { statusService } from "../../services/statusService/statusService";
import { issueService } from "../../services/issueService";
import { useAppSelector } from "hooks";
import stalenessSettingsService from "services/stalenessSettingsService";

export interface WorkplanContextProps {
  firstNations: WorkFirstNation[];
  getWorkById: () => Promise<void>;
  getWorkStatuses: () => Promise<void>;
  getWorkPhases: () => Promise<void>;
  issues: WorkIssue[];
  loadData: () => Promise<void>;
  loading: boolean;
  loadIssues: () => Promise<void>;
  isActiveTeamMember: boolean;
  issueStalenessSetting: StalenessSettings | undefined;
  selectedStaff?: StaffWorkRole;
  selectedWorkPhase?: WorkPhaseAdditionalInfo;
  setFirstNations: Dispatch<SetStateAction<WorkFirstNation[]>>;
  setIssues: Dispatch<SetStateAction<WorkIssue[]>>;
  setSelectedStaff: Dispatch<SetStateAction<StaffWorkRole | undefined>>;
  setSelectedWorkPhase: Dispatch<
    SetStateAction<WorkPhaseAdditionalInfo | undefined>
  >;
  setStatuses: Dispatch<SetStateAction<Status[]>>;
  setTeam: Dispatch<SetStateAction<StaffWorkRole[]>>;
  setWork: Dispatch<SetStateAction<Work | undefined>>;
  setWorkPhases: Dispatch<SetStateAction<WorkPhaseAdditionalInfo[]>>;
  statuses: Status[];
  statusStalenessSetting: StalenessSettings | undefined;
  team: StaffWorkRole[];
  work: Work | undefined;
  workPhases: WorkPhaseAdditionalInfo[];
}
interface WorkPlanContainerRouteParams extends URLSearchParams {
  work_id: string;
}

export const initialWorkPlanContext: WorkplanContextProps = {
  firstNations: [],
  getWorkById: () => new Promise((resolve) => resolve),
  getWorkStatuses: () => new Promise((resolve) => resolve),
  getWorkPhases: () => new Promise((resolve) => resolve),
  issues: [],
  loadData: () => new Promise((resolve) => resolve),
  loading: true,
  loadIssues: () => new Promise((resolve) => resolve),
  isActiveTeamMember: false,
  issueStalenessSetting: undefined,
  selectedStaff: undefined,
  selectedWorkPhase: undefined,
  setFirstNations: () => ({}),
  setIssues: () => ({}),
  setSelectedStaff: () => ({}),
  setSelectedWorkPhase: () => ({}),
  setStatuses: () => ({}),
  setTeam: () => ({}),
  setWork: () => ({}),
  setWorkPhases: () => ({}),
  statuses: [],
  statusStalenessSetting: undefined,
  team: [],
  work: undefined,
  workPhases: [],
};

export const WorkplanContext = createContext<WorkplanContextProps>(
  initialWorkPlanContext
);

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
  const [selectedStaff, setSelectedStaff] = useState<StaffWorkRole>();
  const [issues, setIssues] = useState<WorkIssue[]>([]);
  const [issueStalenessSetting, setIssueStalenessSetting] =
    useState<StalenessSettings>();
  const [statusStalenessSetting, setStatusStalenessSetting] =
    useState<StalenessSettings>();
  const { email } = useAppSelector((state) => state.user.userDetail);

  const getIssues = useCallback(async () => {
    if (!workId) return;
    try {
      const response = await issueService.getAllByWorkId(workId);
      setIssues(response.data);
    } catch (error) {
      console.error("Failed to load Workplan issues", error);
      return;
    }
  }, [workId]);

  const isActiveTeamMember = useMemo(() => {
    return team?.some(
      (member) => member.staff.email === email && member.is_active
    );
  }, [team, email]);

  const getWorkById = useCallback(async () => {
    if (workId) {
      const work = await workService.getById(String(workId));
      setWork(work.data as Work);
    }
  }, [workId]);

  const getWorkPhases = useCallback(async () => {
    if (workId) {
      const workPhasesResult = await workService.getWorkPhases(String(workId));
      const workPhases = workPhasesResult.data as WorkPhaseAdditionalInfo[];
      setWorkPhases(workPhases);
    }
  }, [workId]);

  const getWorkFirstNations = useCallback(async () => {
    if (workId) {
      const firstNationResult = await workService.getWorkFirstNations(
        Number(workId)
      );
      if (firstNationResult.status === 200) {
        const firstNations = (firstNationResult.data as WorkFirstNation[]).map(
          (p) => ({
            ...p,
            status: p.is_active ? ACTIVE_STATUS.ACTIVE : ACTIVE_STATUS.INACTIVE,
          })
        );
        setFirstNations(firstNations);
      }
    }
  }, [workId]);

  const getWorkStatuses = useCallback(async () => {
    if (workId) {
      const statusResult = await statusService.getAllbyWorkId(Number(workId));
      if (statusResult.status === 200) {
        setStatuses(statusResult.data);
      }
    }
  }, [workId]);

  const getWorkTeamMembers = useCallback(async () => {
    if (!workId) return;
    try {
      const teamResult = await workService.getWorkTeamMembers(Number(workId));
      if (teamResult.status === 200) {
        const team = (teamResult.data as StaffWorkRole[]).map((p) => ({
          ...p,
          status: p.is_active ? ACTIVE_STATUS.ACTIVE : ACTIVE_STATUS.INACTIVE,
        }));
        setTeam(team);
      }
    } catch (e) {
      // TODO: handle error TRACK-528
      showNotification(COMMON_ERROR_MESSAGE, { type: "error" });
    }
  }, [workId]);

  const getStalenessSettings = useCallback(async () => {
    try {
      const issueStalenessSetting =
        await stalenessSettingsService.getIssueStaleness();
      const statusStalenessSetting =
        await stalenessSettingsService.getStatusStaleness();
      setIssueStalenessSetting(issueStalenessSetting.data);
      setStatusStalenessSetting(statusStalenessSetting.data);
    } catch (error) {
      showNotification("Could not load Staleness settings", {
        duration: 3000,
        type: "error",
      });
    }
  }, []);

  const loadData = useCallback(async () => {
    if (!workId) return;
    try {
      await getWorkById();
      await getWorkTeamMembers();
      await getWorkPhases();
      await getWorkFirstNations();
      await getWorkStatuses();
      await getStalenessSettings();
      await getIssues();
      setLoading(false);
    } catch (e) {
      // TODO: handle error TRACK-528
      showNotification(COMMON_ERROR_MESSAGE, { type: "error" });
    } finally {
      setLoading(false);
    }
  }, [
    getWorkById,
    getWorkFirstNations,
    getWorkPhases,
    getWorkStatuses,
    getWorkTeamMembers,
    getStalenessSettings,
    getIssues,
    workId,
  ]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <WorkplanContext.Provider
      value={{
        firstNations,
        getWorkById,
        getWorkStatuses,
        getWorkPhases,
        issues,
        loadData,
        loading,
        loadIssues: getIssues,
        isActiveTeamMember,
        issueStalenessSetting,
        selectedStaff,
        selectedWorkPhase,
        setFirstNations,
        setIssues,
        setSelectedStaff,
        setSelectedWorkPhase,
        setStatuses,
        setTeam,
        setWork,
        setWorkPhases,
        statuses,
        statusStalenessSetting,
        team,
        work,
        workPhases,
      }}
    >
      {children}
    </WorkplanContext.Provider>
  );
};
