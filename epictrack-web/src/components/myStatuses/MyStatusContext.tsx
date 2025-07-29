import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { StatusDashboardItem } from "models/status";
import { StalenessSettings } from "models/settings";
import { statusService } from "services/statusService/statusService";
import stalenessSettingsService from "services/stalenessSettingsService";
import { useAppSelector } from "../../hooks";
import { showNotification } from "components/shared/notificationProvider";
import { COMMON_ERROR_MESSAGE } from "constants/application-constant";
import { useCachedState } from "hooks/useCachedFilters";
import { MY_STATUS_CACHED_SEARCH_OPTIONS } from "./constants";
import { workService } from "services/workService/workService";

interface MyStatusContextProps {
  statuses: StatusDashboardItem[];
  loadingStatuses: boolean;
  lazyLoadMoreStatuses: () => any;
  totalStatuses: number;
  searchOptions: StatusSearchOptions;
  setSearchOptions: React.Dispatch<React.SetStateAction<StatusSearchOptions>>;
  statusStalenessSettings: StalenessSettings | undefined;
  loadingMoreStatuses: boolean;
  setLoadingMoreStatuses: React.Dispatch<React.SetStateAction<boolean>>;
  sortOrder: string;
  setSortOrder: React.Dispatch<React.SetStateAction<string>>;
  userWorkIds?: Number[];
  // Status modal controls
  isStatusDialogOpen: boolean;
  showStatusDialog: (status?: StatusDashboardItem) => void;
  hideStatusDialog: () => void;
  selectedStatus: StatusDashboardItem | null;
  refetchStatuses: () => void;
}
export type StatusFilters = {
  project_is_active: string[];
  regions: string[];
  staleness: string[];
  is_approved: string[];
  teams: string[];
  text: string;
  work_is_active: string[];
  work_types: string[];
};

export type StatusSearchOptions = StatusFilters & {
  staff_id: number | null;
};

export const statusDefaultFilters: StatusFilters = {
  project_is_active: ["true"],
  regions: [],
  staleness: [],
  is_approved: [],
  teams: [],
  text: "",
  work_is_active: ["true"],
  work_types: [],
};

export const defaultSearchOptions: StatusSearchOptions = {
  ...statusDefaultFilters,
  staff_id: null,
};

export const MyStatusesContext = createContext<MyStatusContextProps>({
  statuses: [],
  loadingStatuses: false,
  lazyLoadMoreStatuses: () => {
    return;
  },
  totalStatuses: 0,
  searchOptions: defaultSearchOptions,
  setSearchOptions: () => {
    return;
  },
  statusStalenessSettings: undefined,
  loadingMoreStatuses: false,
  setLoadingMoreStatuses: () => {
    return;
  },
  sortOrder: "desc",
  setSortOrder: () => {
    return;
  },
  userWorkIds: [],
  // Status modal controls
  isStatusDialogOpen: false,
  showStatusDialog: () => {},
  hideStatusDialog: () => {},
  selectedStatus: null,
  refetchStatuses: () => {
    return;
  },
});

const PAGE_SIZE = 12;

export const MyStatusesProvider = ({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}) => {
  const user = useAppSelector((state) => state.user.userDetail);
  const [loadingStatuses, setLoadingStatuses] = useState<boolean>(true);
  const [loadingMoreStatuses, setLoadingMoreStatuses] =
    useState<boolean>(false);
  const [statusStalenessSettings, setStatusStalenessSettings] =
    useState<StalenessSettings>();
  const [statuses, setStatuses] = useState<StatusDashboardItem[]>([]);
  const [totalStatuses, setTotalStatuses] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [sortOrder, setSortOrder] = useState<string>("desc");
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] =
    useState<StatusDashboardItem | null>(null);
  const [userWorkIds, setUserWorkIds] = useState<Number[]>([]);

  const showStatusDialog = useCallback((status?: StatusDashboardItem) => {
    setSelectedStatus(status ?? null);
    setIsStatusDialogOpen(true);
  }, []);

  const hideStatusDialog = useCallback(() => {
    setSelectedStatus(null);
    setIsStatusDialogOpen(false);
  }, []);

  const [searchOptions, setSearchOptions] = useCachedState(
    MY_STATUS_CACHED_SEARCH_OPTIONS,
    {
      ...defaultSearchOptions,
      staff_id: user?.staffId || null,
    }
  );

  const fetchStatuses = useCallback(
    async (page: number, shouldAppend = false) => {
      try {
        const result = await statusService.getAll(
          page,
          PAGE_SIZE,
          sortOrder,
          searchOptions
        );
        if (!result?.data?.items || typeof result.data.total !== "number") {
          throw new Error("Failed to retrieve work statuses.");
        }
        setPage(page);
        setStatuses((prev) =>
          shouldAppend
            ? [...prev, ...result.data.items]
            : [...result.data.items]
        );
        setTotalStatuses(result.data.total);
        setLoadingStatuses(false);
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

  const refetchStatuses = useCallback(() => {
    fetchStatuses(1);
  }, [fetchStatuses]);

  const getStalenessSettings = useCallback(async () => {
    try {
      const statusStalenessSetting =
        await stalenessSettingsService.getStatusStaleness();
      setStatusStalenessSettings(statusStalenessSetting.data);
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

  const lazyLoadMoreStatuses = useCallback(async () => {
    setLoadingMoreStatuses(true);
    await fetchStatuses(page + 1, true);
    setLoadingMoreStatuses(false);
  }, [fetchStatuses, page]);

  useEffect(() => {
    const loadStatuses = async () => {
      setLoadingStatuses(true);
      await fetchStatuses(1);
      setLoadingStatuses(false);
    };
    loadStatuses();
  }, [fetchStatuses, searchOptions]);

  const contextValue = useMemo(
    () => ({
      statuses,
      loadingStatuses,
      lazyLoadMoreStatuses,
      totalStatuses,
      searchOptions,
      setSearchOptions,
      loadingMoreStatuses,
      setLoadingMoreStatuses,
      statusStalenessSettings,
      sortOrder,
      setSortOrder,
      refetchStatuses,
      userWorkIds,
      // modal
      isStatusDialogOpen,
      showStatusDialog,
      hideStatusDialog,
      selectedStatus,
    }),
    [
      statuses,
      loadingStatuses,
      lazyLoadMoreStatuses,
      totalStatuses,
      searchOptions,
      setSearchOptions,
      loadingMoreStatuses,
      setLoadingMoreStatuses,
      statusStalenessSettings,
      sortOrder,
      setSortOrder,
      refetchStatuses,
      userWorkIds,
      isStatusDialogOpen,
      showStatusDialog,
      hideStatusDialog,
      selectedStatus,
    ]
  );

  return (
    <MyStatusesContext.Provider value={contextValue}>
      {children}
    </MyStatusesContext.Provider>
  );
};
