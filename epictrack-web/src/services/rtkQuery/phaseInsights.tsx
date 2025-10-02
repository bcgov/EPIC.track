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

export const phaseInsightsApi = createApi({
  reducerPath: "phaseInsightsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: AppConfig.apiUrl,
    prepareHeaders,
  }),
  endpoints: (builder) => ({
    getWorkPhases: builder.query<
      ({ work: Work } & WorkPhase & WorkPhaseAdditionalInfo)[],
      { legislated?: boolean } | void
    >({
      query: ({ legislated = true } = {}) =>
        `work-phases?legislated=${legislated}`,
    }),
    getPhasesByAverageOverage: builder.query<
      PhasesByAverageOverage[],
      { columnFilters?: ColumnFilter[]; selectedWorkType?: string }
    >({
      query: ({ columnFilters, selectedWorkType }) => ({
        url: `insights/phases`,
        method: "POST",
        body: {
          group_by: "average_phase_overage",
          filters: columnFilters ?? [],
          selected_work_type_id: selectedWorkType,
        },
      }),
    }),
    getPercentOfPhasesWithOverages: builder.query<
      PhasesByAverageOverage[],
      { columnFilters?: ColumnFilter[]; selectedWorkType?: string }
    >({
      query: ({ columnFilters, selectedWorkType }) => ({
        url: `insights/phases`,
        method: "POST",
        body: {
          group_by: "percent_of_phases_with_overages",
          filters: columnFilters ?? [],
          selected_work_type_id: selectedWorkType,
        },
      }),
    }),
    getOverageResponsibility: builder.query<
      ResponsibilityByWorktypePhase[],
      {
        columnFilters?: ColumnFilter[];
        selectedWorkType?: string;
        selectedPhase?: string;
      }
    >({
      query: ({ columnFilters, selectedWorkType, selectedPhase }) => ({
        url: `insights/phases`,
        method: "POST",
        body: {
          group_by: "overage_responsibility",
          filters: columnFilters ?? [],
          selected_work_type_id: selectedWorkType,
          selected_phase_id: selectedPhase,
        },
      }),
    }),
    getOverageByAct: builder.query<
      OveragesByAct[],
      {
        columnFilters?: ColumnFilter[];
        selectedWorkType?: string;
      }
    >({
      query: ({ columnFilters, selectedWorkType }) => ({
        url: `insights/phases`,
        method: "POST",
        body: {
          group_by: "overages_by_act",
          filters: columnFilters ?? [],
          selected_work_type_id: selectedWorkType,
        },
      }),
    }),
    getOverageByYear: builder.query<
      OveragesByAct[],
      {
        columnFilters?: ColumnFilter[];
        selectedWorkType?: string;
        selectedYear?: string;
      }
    >({
      query: ({ columnFilters, selectedWorkType, selectedYear }) => ({
        url: `insights/phases`,
        method: "POST",
        body: {
          group_by: "overages_by_year",
          filters: columnFilters ?? [],
          selected_work_type_id: selectedWorkType,
          selected_year: selectedYear,
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
