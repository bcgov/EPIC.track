import { useCallback, useEffect, useMemo, useState } from "react";
import { MRT_SortingState } from "material-react-table";
import { Work } from "models/work";
import { showNotification } from "components/shared/notificationProvider";
import { useInsightsContext } from "components/insights/InsightsContext";
import { useTableFilterContext } from "components/insights/TableFilterContext";
import {
  useGetWorkListingFilterOptionsQuery,
  useGetWorksListingQuery,
  useLazyGetWorksListingQuery,
  WorkListingFilterOptions,
} from "services/rtkQuery/workInsights";

const EMPTY_FILTER_OPTIONS: WorkListingFilterOptions = {
  projects: [],
  work_types: [],
  phases: [],
  ministries: [],
  federal_involvements: [],
  indigenous_nations: [],
  rel_staff: [],
  work_states: [],
  started_years: [],
  closed_years: [],
};

type UseWorkListingOptions = {
  isActive: boolean;
  includeIndigenousNations?: boolean;
  includeRelStaff?: boolean;
};

export const useWorkListing = ({
  isActive,
  includeIndigenousNations,
  includeRelStaff,
}: UseWorkListingOptions) => {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 15 });
  const [sorting, setSorting] = useState<MRT_SortingState>([
    { id: "title", desc: false },
  ]);
  const { columnFilters, setColumnFilters } = useTableFilterContext();
  const { isUserInsights, staffId } = useInsightsContext();

  const scope = useMemo(
    () => ({
      is_active: isActive,
      ...(isUserInsights && staffId ? { staffId } : {}),
    }),
    [isActive, isUserInsights, staffId],
  );

  const request = useMemo(
    () => ({
      ...scope,
      filters: columnFilters,
      sortKey: sorting[0]?.id,
      sortOrder: (sorting[0]?.desc ? "desc" : "asc") as "asc" | "desc",
      includeIndigenousNations,
      includeRelStaff,
    }),
    [scope, columnFilters, sorting, includeIndigenousNations, includeRelStaff],
  );

  const { data, error, isLoading, isFetching } = useGetWorksListingQuery({
    ...request,
    page: pagination.pageIndex + 1,
    size: pagination.pageSize,
  });
  const { data: filterOptions } = useGetWorkListingFilterOptionsQuery(scope);
  const [fetchEveryWork] = useLazyGetWorksListingQuery();

  useEffect(() => {
    if (error) {
      showNotification("Error fetching Works", {
        duration: 3000,
        type: "error",
      });
    }
  }, [error]);

  const onColumnFiltersChange = useCallback(
    (updaterOrValue: any) => {
      setColumnFilters(updaterOrValue);
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    },
    [setColumnFilters],
  );

  const buildExportRows = useCallback(
    async (toExportRow: (work: Work) => Record<string, unknown>) => {
      const everyWork = await fetchEveryWork(request).unwrap();
      return everyWork.items.map(toExportRow);
    },
    [fetchEveryWork, request],
  );

  const works = useMemo(() => data?.items ?? [], [data]);

  return {
    works,
    total: data?.total ?? 0,
    filterOptions: filterOptions ?? EMPTY_FILTER_OPTIONS,
    isLoading,
    isFetching,
    pagination,
    setPagination,
    sorting,
    setSorting,
    columnFilters,
    onColumnFiltersChange,
    buildExportRows,
  };
};
