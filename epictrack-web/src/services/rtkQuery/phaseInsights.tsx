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
  { staffId, viewUnderage }: { staffId?: number; viewUnderage?: boolean } = {},
): string {
  const params: string[] = [];

  if (viewUnderage !== undefined) {
    params.push(`view_underage=${viewUnderage}`);
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
      { staffId?: number; viewUnderage?: boolean } | void
    >({
      query: ({ staffId, viewUnderage } = {}) =>
        buildQueryString("work-phases", { staffId, viewUnderage }),
    }),
    getPhasesByMedianOverage: builder.query<
      PhasesByMedianOverage[],
      {
        columnFilters?: ColumnFilter[];
        staffId?: number;
        isUnderageToggled?: boolean;
      }
    >({
      query: ({ columnFilters, staffId, isUnderageToggled }) => ({
        url: `insights/phases`,
        method: "POST",
        body: {
          group_by: "median_phase_overage",
          filters: columnFilters ?? [],
          staff_id: staffId,
          is_underage_toggled: isUnderageToggled,
        },
      }),
    }),
    getPercentOfPhasesWithOverages: builder.query<
      PhasesByMedianOverage[],
      {
        columnFilters?: ColumnFilter[];
        staffId?: number;
        isUnderageToggled?: boolean;
      }
    >({
      query: ({ columnFilters, staffId, isUnderageToggled }) => ({
        url: `insights/phases`,
        method: "POST",
        body: {
          group_by: "percent_of_phases_with_overages",
          filters: columnFilters ?? [],
          staff_id: staffId,
          is_underage_toggled: isUnderageToggled,
        },
      }),
    }),
    getOverageResponsibility: builder.query<
      ResponsibilityByWorktypePhase[],
      {
        columnFilters?: ColumnFilter[];
        staffId?: number;
        isUnderageToggled?: boolean;
      }
    >({
      query: ({ columnFilters, staffId, isUnderageToggled }) => ({
        url: `insights/phases`,
        method: "POST",
        body: {
          group_by: "overage_responsibility",
          filters: columnFilters ?? [],
          staff_id: staffId,
          is_underage_toggled: isUnderageToggled,
        },
      }),
    }),
    getMedianPhaseOverageByWorktype: builder.query<
      MedianOverageByWorktype[],
      {
        columnFilters?: ColumnFilter[];
        staffId?: number;
        isUnderageToggled?: boolean;
      }
    >({
      query: ({ columnFilters, staffId, isUnderageToggled }) => ({
        url: `insights/phases`,
        method: "POST",
        body: {
          group_by: "median_overage_by_worktype",
          filters: columnFilters ?? [],
          staff_id: staffId,
          is_underage_toggled: isUnderageToggled,
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
  useLazyGetWorkPhasesQuery,
  useGetMedianPhaseOverageByWorktypeQuery,
} = phaseInsightsApi;
