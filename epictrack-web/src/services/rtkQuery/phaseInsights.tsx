import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { AppConfig } from "config";
import {
  OveragesByAct,
  PhasesByAverageOverage,
  ResponsibilityByWorktypePhase,
} from "models/insights";
import { prepareHeaders } from "./util";
import { ColumnFilter } from "components/shared/MasterTrackTable/type";
import { Work, WorkPhase, WorkPhaseAdditionalInfo } from "models/work";

function buildQueryString(
  base: string,
  { legislated, staffId }: { legislated?: boolean; staffId?: number } = {},
): string {
  const params: string[] = [];

  if (legislated !== undefined) {
    params.push(`legislated=${legislated}`);
  }
  if (staffId !== undefined) {
    params.push(`staff_id=${staffId}`);
  }

  return params.length ? `${base}?${params.join("&")}` : base;
}

export const phaseInsightsApi = createApi({
  reducerPath: "phaseInsightsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: AppConfig.apiUrl,
    prepareHeaders,
  }),
  endpoints: (builder) => ({
    getWorkPhases: builder.query<
      ({ work: Work } & WorkPhase & WorkPhaseAdditionalInfo)[],
      { legislated?: boolean; staffId?: number } | void
    >({
      query: ({ legislated = true, staffId } = {}) =>
        buildQueryString("work-phases", { legislated, staffId }),
    }),
    getPhasesByAverageOverage: builder.query<
      PhasesByAverageOverage[],
      {
        columnFilters?: ColumnFilter[];
        selectedWorkType?: string;
        staffId?: number;
      }
    >({
      query: ({ columnFilters, selectedWorkType, staffId }) => ({
        url: `insights/phases`,
        method: "POST",
        body: {
          group_by: "average_phase_overage",
          filters: columnFilters ?? [],
          selected_work_type_id: selectedWorkType,
          staff_id: staffId,
        },
      }),
    }),
    getPercentOfPhasesWithOverages: builder.query<
      PhasesByAverageOverage[],
      {
        columnFilters?: ColumnFilter[];
        selectedWorkType?: string;
        staffId?: number;
      }
    >({
      query: ({ columnFilters, selectedWorkType, staffId }) => ({
        url: `insights/phases`,
        method: "POST",
        body: {
          group_by: "percent_of_phases_with_overages",
          filters: columnFilters ?? [],
          selected_work_type_id: selectedWorkType,
          staff_id: staffId,
        },
      }),
    }),
    getOverageResponsibility: builder.query<
      ResponsibilityByWorktypePhase[],
      {
        columnFilters?: ColumnFilter[];
        selectedWorkType?: string;
        selectedPhase?: string;
        staffId?: number;
      }
    >({
      query: ({ columnFilters, selectedWorkType, selectedPhase, staffId }) => ({
        url: `insights/phases`,
        method: "POST",
        body: {
          group_by: "overage_responsibility",
          filters: columnFilters ?? [],
          selected_work_type_id: selectedWorkType,
          selected_phase_id: selectedPhase,
          staff_id: staffId,
        },
      }),
    }),
    getOverageByAct: builder.query<
      OveragesByAct[],
      {
        columnFilters?: ColumnFilter[];
        selectedWorkType?: string;
        staffId?: number;
      }
    >({
      query: ({ columnFilters, selectedWorkType, staffId }) => ({
        url: `insights/phases`,
        method: "POST",
        body: {
          group_by: "overages_by_act",
          filters: columnFilters ?? [],
          selected_work_type_id: selectedWorkType,
          staff_id: staffId,
        },
      }),
    }),
    getOverageByYear: builder.query<
      OveragesByAct[],
      {
        columnFilters?: ColumnFilter[];
        selectedWorkType?: string;
        selectedYear?: string;
        staffId?: number;
      }
    >({
      query: ({ columnFilters, selectedWorkType, selectedYear, staffId }) => ({
        url: `insights/phases`,
        method: "POST",
        body: {
          group_by: "overages_by_year",
          filters: columnFilters ?? [],
          selected_work_type_id: selectedWorkType,
          selected_year: selectedYear,
          staff_id: staffId,
        },
      }),
    }),
  }),
  refetchOnMountOrArgChange: 300,
});

export const {
  useGetPhasesByAverageOverageQuery,
  useGetPercentOfPhasesWithOveragesQuery,
  useGetOverageResponsibilityQuery,
  useGetWorkPhasesQuery,
  useGetOverageByActQuery,
  useGetOverageByYearQuery,
} = phaseInsightsApi;
