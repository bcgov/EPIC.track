import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAppSelector } from "hooks";
import { useCachedState } from "hooks/useCachedFilters";
import { WorkIssueDashboardItem } from "models/Issue";
import { StalenessSettings } from "models/settings";
import { issueService } from "services/issueService";
import stalenessSettingsService from "services/stalenessSettingsService";
import { workService } from "services/workService/workService";
import { showNotification } from "components/shared/notificationProvider";
import { COMMON_ERROR_MESSAGE } from "constants/application-constant";
import { MY_ISSUES_CACHED_SEARCH_OPTIONS } from "../constants";

interface MyIssueContextProps {
  issues: WorkIssueDashboardItem[];
  loadingIssues: boolean;
  lazyLoadMoreIssues: () => any;
  totalIssues: number;
  searchOptions: IssueSearchOptions;
  setSearchOptions: React.Dispatch<React.SetStateAction<IssueSearchOptions>>;
  issueStalenessSettings: StalenessSettings | undefined;
  loadingMoreIssues: boolean;
  setLoadingMoreIssues: React.Dispatch<React.SetStateAction<boolean>>;
  sortOrder: string;
  setSortOrder: React.Dispatch<React.SetStateAction<string>>;
  userWorkIds?: Number[];
  // Issues modal controls
  isIssueDialogOpen: boolean;
  showIssueDialog: (Issues?: WorkIssueDashboardItem) => void;
  hideIssueDialog: () => void;
  selectedIssue: WorkIssueDashboardItem | null;
  refetchIssues: () => void;
}
export type IssueFilters = {
  issue_state: string[];
  regions: string[];
  staleness: string[];
  is_approved: string[];
  teams: string[];
  text: string;
  work_types: string[];
};

export type IssueSearchOptions = IssueFilters & {
  staff_id: number | null;
};

export const issueDefaultFilters: IssueFilters = {
  issue_state: ["is_active:true"],
  regions: [],
  staleness: [],
  is_approved: [],
  teams: [],
  text: "",
  work_types: [],
};

export const defaultSearchOptions: IssueSearchOptions = {
  ...issueDefaultFilters,
  staff_id: null,
};

export const MyIssuesContext = createContext<MyIssueContextProps>({
  issues: [],
  loadingIssues: false,
  lazyLoadMoreIssues: () => {
    return;
  },
  totalIssues: 0,
  searchOptions: defaultSearchOptions,
  setSearchOptions: () => {
    return;
  },
  issueStalenessSettings: undefined,
  loadingMoreIssues: false,
  setLoadingMoreIssues: () => {
    return;
  },
  sortOrder: "desc",
  setSortOrder: () => {
    return;
  },
  userWorkIds: [],
  // Issues modal controls
  isIssueDialogOpen: false,
  showIssueDialog: () => {},
  hideIssueDialog: () => {},
  selectedIssue: null,
  refetchIssues: () => {
    return;
  },
});

const PAGE_SIZE = 12;

export const MyIssuesProvider = ({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}) => {
  const user = useAppSelector((state) => state.user.userDetail);
  const [loadingIssues, setLoadingIssues] = useState<boolean>(true);
  const [loadingMoreIssues, setLoadingMoreIssues] = useState<boolean>(false);
  const [issueStalenessSettings, setIssueStalenessSettings] =
    useState<StalenessSettings>();
  const [issues, setIssues] = useState<WorkIssueDashboardItem[]>([]);
  const [totalIssues, setTotalIssues] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [sortOrder, setSortOrder] = useState<string>("asc");
  const [isIssueDialogOpen, setIsIssueDialogOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] =
    useState<WorkIssueDashboardItem | null>(null);
  const [userWorkIds, setUserWorkIds] = useState<Number[]>([]);

  const showIssueDialog = useCallback((Issues?: WorkIssueDashboardItem) => {
    setSelectedIssue(Issues ?? null);
    setIsIssueDialogOpen(true);
  }, []);

  const hideIssueDialog = useCallback(() => {
    setSelectedIssue(null);
    setIsIssueDialogOpen(false);
  }, []);

  const [searchOptions, setSearchOptions] = useCachedState(
    MY_ISSUES_CACHED_SEARCH_OPTIONS,
    {
      ...defaultSearchOptions,
      staff_id: user?.staffId || null,
    }
  );

  const fetchIssues = useCallback(
    async (page: number, shouldAppend = false) => {
      try {
        const result = await issueService.getAll(
          page,
          PAGE_SIZE,
          sortOrder,
          searchOptions
        );
        if (!result?.data?.items || typeof result.data.total !== "number") {
          throw new Error("Failed to retrieve work issues.");
        }
        setPage(page);
        setIssues((prev) =>
          shouldAppend
            ? [...prev, ...result.data.items]
            : [...result.data.items]
        );
        setTotalIssues(result.data.total);
        setLoadingIssues(false);
      } catch (error) {
        showNotification(COMMON_ERROR_MESSAGE, {
          type: "error",
        });
      }
    },
    [searchOptions, sortOrder]
  );

  const fetchUserWorkIds = useCallback(async () => {
    try {
      const workIds = await workService.getWorkIdsByStaff(user?.staffId);
      if (workIds?.data) {
        setUserWorkIds(workIds.data || []);
      } else {
        throw new Error("Failed to retrieve work IDs.");
      }
    } catch (error) {
      showNotification("Could not load user's Works", {
        duration: 3000,
        type: "error",
      });
    }
  }, [user?.staffId]);

  const refetchIssues = useCallback(() => {
    fetchIssues(1);
  }, [fetchIssues]);

  const getStalenessSettings = useCallback(async () => {
    try {
      const issueStalenessSetting =
        await stalenessSettingsService.getIssueStaleness();
      setIssueStalenessSettings(issueStalenessSetting.data);
    } catch (error) {
      showNotification("Could not load Staleness settings", {
        duration: 3000,
        type: "error",
      });
    }
  }, []);

  useEffect(() => {
    getStalenessSettings();
  }, [getStalenessSettings]);

  useEffect(() => {
    if (user) {
      fetchUserWorkIds();
    }
  }, [user, fetchUserWorkIds]);

  const lazyLoadMoreIssues = useCallback(async () => {
    setLoadingMoreIssues(true);
    await fetchIssues(page + 1, true);
    setLoadingMoreIssues(false);
  }, [fetchIssues, page]);

  useEffect(() => {
    const loadIssues = async () => {
      setLoadingIssues(true);
      await fetchIssues(1);
      setLoadingIssues(false);
    };
    loadIssues();
  }, [fetchIssues, searchOptions]);

  const contextValue = useMemo(
    () => ({
      issues,
      loadingIssues,
      lazyLoadMoreIssues,
      totalIssues,
      searchOptions,
      setSearchOptions,
      loadingMoreIssues,
      setLoadingMoreIssues,
      issueStalenessSettings,
      sortOrder,
      setSortOrder,
      refetchIssues,
      userWorkIds,
      // modal
      isIssueDialogOpen,
      showIssueDialog,
      hideIssueDialog,
      selectedIssue,
    }),
    [
      issues,
      loadingIssues,
      lazyLoadMoreIssues,
      totalIssues,
      searchOptions,
      setSearchOptions,
      loadingMoreIssues,
      setLoadingMoreIssues,
      issueStalenessSettings,
      sortOrder,
      setSortOrder,
      refetchIssues,
      userWorkIds,
      isIssueDialogOpen,
      showIssueDialog,
      hideIssueDialog,
      selectedIssue,
    ]
  );

  return (
    <MyIssuesContext.Provider value={contextValue}>
      {children}
    </MyIssuesContext.Provider>
  );
};
