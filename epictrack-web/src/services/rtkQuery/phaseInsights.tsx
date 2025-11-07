import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { AppConfig } from "config";
import {
  MedianOverageByWorktype,
  PhasesByMedianOverage,
  ResponsibilityByWorktypePhase,
} from "models/insights";
import { prepareHeaders } from "./util";
import { ColumnFilter } from "components/shared/MasterTrackTable/type";
import { WorkPhaseInsight } from "models/work";

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
      WorkPhaseInsight[],
      { legislated?: boolean; staffId?: number } | void
    >({
      query: ({ legislated = true, staffId } = {}) =>
        buildQueryString("work-phases", { legislated, staffId }),
    }),
    getPhasesByMedianOverage: builder.query<
      PhasesByMedianOverage[],
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
          group_by: "median_phase_overage",
          filters: columnFilters ?? [],
          selected_work_type_id: selectedWorkType,
          staff_id: staffId,
        },
      }),
    }),
    getPercentOfPhasesWithOverages: builder.query<
      PhasesByMedianOverage[],
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
    getMedianPhaseOverageByWorktype: builder.query<
      MedianOverageByWorktype[],
      {
        columnFilters?: ColumnFilter[];
        staffId?: number;
      }
    >({
      query: ({ columnFilters, staffId }) => ({
        url: `insights/phases`,
        method: "POST",
        body: {
          group_by: "median_overage_by_worktype",
          filters: columnFilters ?? [],
          staff_id: staffId,
        },
      }),
    }),
  }),
  refetchOnMountOrArgChange: 300,
});

export const {
  useGetPhasesByMedianOverageQuery,
  useGetPercentOfPhasesWithOveragesQuery,
  useGetOverageResponsibilityQuery,
  useGetWorkPhasesQuery,
  useGetMedianPhaseOverageByWorktypeQuery,
} = phaseInsightsApi;
