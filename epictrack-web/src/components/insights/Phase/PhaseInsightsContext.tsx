import { WorkPhaseInsight } from "models/work";
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import {
  useGetWorkPhasesQuery,
  useLazyGetWorkPhasesQuery,
} from "services/rtkQuery/phaseInsights";
import { useInsightsContext } from "../InsightsContext";
import { json2csv } from "json-2-csv";
import { dateUtils } from "utils";

interface PhaseInsightsContextState {
  workPhases: WorkPhaseInsight[];
  loadingWorkPhases: boolean;
  viewUnderage: boolean;
  setViewUnderage: React.Dispatch<React.SetStateAction<boolean>>;
  exportAllPhaseData: () => Promise<void>;
  isExporting: boolean;
}

export const PhaseInsightsContext = createContext<
  PhaseInsightsContextState | undefined
>(undefined);

type PhaseInsightsContextProviderProps = {
  children: React.ReactNode;
};

export const PhaseInsightsContextProvider: React.FC<
  PhaseInsightsContextProviderProps
> = ({ children }) => {
  const { isUserInsights, staffId } = useInsightsContext();

  const [viewUnderage, setViewUnderage] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const queryArg = useMemo(
    () => ({
      staffId: isUserInsights ? staffId : undefined,
      viewUnderage,
    }),
    [isUserInsights, staffId, viewUnderage],
  );

  const { data: workPhasesData, isLoading: loadingWorkPhases } =
    useGetWorkPhasesQuery(queryArg, {
      refetchOnMountOrArgChange: true,
    });

  const [fetchWorkPhases] = useLazyGetWorkPhasesQuery();

  const exportAllPhaseData = useCallback(async () => {
    setIsExporting(true);
    try {
      const staffIdParam = isUserInsights ? staffId : undefined;

      // Fetch both overages and underages
      const [overagesResult, underagesResult] = await Promise.all([
        fetchWorkPhases({ staffId: staffIdParam, viewUnderage: false }),
        fetchWorkPhases({ staffId: staffIdParam, viewUnderage: true }),
      ]);

      const overages = overagesResult.data ?? [];
      const underages = underagesResult.data ?? [];

      // Track which work_phase_ids are overages vs underages
      const overageIds = new Set(overages.map((p) => p.work_phase_id));
      const underageIds = new Set(underages.map((p) => p.work_phase_id));

      // Combine and deduplicate by work_phase_id, preferring overage data
      const allPhases = [...overages, ...underages];
      const uniquePhases = Array.from(
        new Map(allPhases.map((p) => [p.work_phase_id, p])).values(),
      ).sort((a, b) => a.work_title.localeCompare(b.work_title));

      const csvColumns = [
        "work_title",
        "work_type_name",
        "phase_name",
        "work_phase_start_date",
        "work_phase_end_date",
        "legislated_length",
        "days_taken",
        "overage",
        "underage",
        "phase_overage_responsibilities",
        "work_is_active",
      ];

      const csvRows = uniquePhases.map((row) => {
        const isOverage = overageIds.has(row.work_phase_id);
        const isUnderage = underageIds.has(row.work_phase_id);
        return {
          work_title: row.work_title,
          work_type_name: row.work_type_name,
          phase_name: row.phase_name,
          work_phase_start_date: row.work_phase_start_date,
          work_phase_end_date: row.work_phase_end_date,
          legislated_length: row.legislated_length,
          days_taken: row.days_taken,
          overage: isOverage ? row.days_over : "",
          underage: isUnderage ? row.days_over : "",
          phase_overage_responsibilities:
            row.phase_overage_responsibilities.join(", "),
          work_is_active: row.work_is_active,
        };
      });

      const csv = await json2csv(csvRows, {
        emptyFieldValue: "",
        keys: csvColumns,
      });

      const url = window.URL.createObjectURL(new Blob([csv as string]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `phase-insights-${dateUtils.formatDate(new Date().toISOString())}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setIsExporting(false);
    }
  }, [fetchWorkPhases, isUserInsights, staffId]);

  const contextValue = useMemo(
    () => ({
      workPhases: workPhasesData ?? [],
      loadingWorkPhases,
      viewUnderage,
      setViewUnderage,
      exportAllPhaseData,
      isExporting,
    }),
    [
      workPhasesData,
      loadingWorkPhases,
      viewUnderage,
      exportAllPhaseData,
      isExporting,
    ],
  );
  return (
    <PhaseInsightsContext.Provider value={contextValue}>
      {children}
    </PhaseInsightsContext.Provider>
  );
};

export const usePhaseInsightsContext = () => {
  const context = useContext(PhaseInsightsContext);
  if (!context) {
    throw new Error(
      "usePhaseInsightsContext must be used within a PhaseInsightsContextProvider",
    );
  }
  return context;
};
