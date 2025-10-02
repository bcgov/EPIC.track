// worksApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { AppConfig } from "config";
import {
  WorkByType,
  WorkByTeam,
  WorkByLead,
  WorkByMinistry,
  WorkByFederalInvolvement,
  WorkByNation,
  WorkByStaff,
  AssessmentByPhase,
  WorkByYear,
  WorkStateByYear,
} from "models/insights";
import { prepareHeaders } from "./util";
import { Work } from "models/work";
import { ColumnFilter } from "components/shared/MasterTrackTable/type";

export const workInsightsApi = createApi({
  tagTypes: [
    "Works",
    "WorksByStaff",
    "WorksByType",
    "WorksByTeam",
    "WorksByLead",
    "WorksByMinistry",
    "WorksByFederalInvolvement",
    "WorksByNation",
    "WorksWithNations",
    "AssessmentsByPhase",
    "WorksByYearOpened",
    "WorksByYearCompleted",
    "WorkClosureBreakdown",
  ],
  reducerPath: "workInsightsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: AppConfig.apiUrl,
    prepareHeaders,
  }),
  endpoints: (builder) => ({
    getAssessmentsByPhase: builder.query<
      AssessmentByPhase[],
      { columnFilters?: ColumnFilter[] }
    >({
      query: ({ columnFilters }) => ({
        url: `insights/works`,
        method: "POST",
        body: {
          group_by: "assessment_by_phase",
          filters: columnFilters ?? [],
        },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ phase_id }) => ({
                type: "AssessmentsByPhase" as const,
                id: phase_id,
              })),
              { type: "AssessmentsByPhase", id: "LIST" },
            ]
          : [{ type: "AssessmentsByPhase", id: "LIST" }],
    }),
    getAllWorks: builder.query<Work[], boolean | void>({
      query: (is_active = true) => `works`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: "Works" as const,
                id,
              })),
              { type: "Works", id: "LIST" },
            ]
          : [{ type: "Works", id: "LIST" }],
    }),
    getWorks: builder.query<
      Work[],
      { is_active?: boolean; include_phase_status?: boolean } | void
    >({
      query: ({ is_active = true, include_phase_status = false } = {}) =>
        `works?is_active=${is_active}&include_phase_status=${include_phase_status}`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: "Works" as const,
                id,
              })),
              { type: "Works", id: "LIST" },
            ]
          : [{ type: "Works", id: "LIST" }],
    }),
    getWorksByType: builder.query<
      WorkByType[],
      { columnFilters?: ColumnFilter[] }
    >({
      query: ({ columnFilters }) => ({
        url: `insights/works`,
        method: "POST",
        body: {
          group_by: "type",
          filters: columnFilters ?? [],
        },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ work_type_id }) => ({
                type: "WorksByType" as const,
                id: work_type_id,
              })),
              { type: "WorksByType", id: "LIST" },
            ]
          : [{ type: "WorksByType", id: "LIST" }],
    }),
    getWorksWithNations: builder.query<Work[], void>({
      query: () => `works?is_active=true&include_indigenous_nations=true`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: "WorksWithNations" as const,
                id,
              })),
              { type: "WorksWithNations", id: "LIST" },
            ]
          : [{ type: "WorksWithNations", id: "LIST" }],
    }),
    getWorkByMinistry: builder.query<
      WorkByMinistry[],
      { columnFilters?: ColumnFilter[] }
    >({
      query: ({ columnFilters }) => ({
        url: `insights/works`,
        method: "POST",
        body: {
          group_by: "ministry",
          filters: columnFilters ?? [],
        },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ ministry_id }) => ({
                type: "WorksByMinistry" as const,
                id: ministry_id,
              })),
              { type: "WorksByMinistry", id: "LIST" },
            ]
          : [{ type: "WorksByMinistry", id: "LIST" }],
    }),
    getWorksByFederalInvolvement: builder.query<
      WorkByFederalInvolvement[],
      { columnFilters?: ColumnFilter[] }
    >({
      query: ({ columnFilters }) => ({
        url: `insights/works`,
        method: "POST",
        body: {
          group_by: "federal_involvement",
          filters: columnFilters ?? [],
        },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ federal_involvement_id }) => ({
                type: "WorksByFederalInvolvement" as const,
                id: federal_involvement_id,
              })),
              { type: "WorksByFederalInvolvement", id: "LIST" },
            ]
          : [{ type: "WorksByFederalInvolvement", id: "LIST" }],
    }),
    getWorksByNation: builder.query<
      WorkByNation[],
      { columnFilters?: ColumnFilter[] }
    >({
      query: ({ columnFilters }) => ({
        url: `insights/works`,
        method: "POST",
        body: {
          group_by: "first_nation",
          filters: columnFilters ?? [],
        },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ first_nation_id }) => ({
                type: "WorksByNation" as const,
                id: first_nation_id,
              })),
              { type: "WorksByNation", id: "LIST" },
            ]
          : [{ type: "WorksByNation", id: "LIST" }],
    }),
    getWorksByTeam: builder.query<
      WorkByTeam[],
      { columnFilters?: ColumnFilter[] }
    >({
      query: ({ columnFilters }) => ({
        url: `insights/works`,
        method: "POST",
        body: {
          group_by: "team",
          filters: columnFilters ?? [],
        },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ eao_team_id }) => ({
                type: "WorksByTeam" as const,
                id: eao_team_id,
              })),
              { type: "WorksByTeam", id: "LIST" },
            ]
          : [{ type: "WorksByTeam", id: "LIST" }],
    }),
    getWorksByLead: builder.query<
      WorkByLead[],
      { columnFilters?: ColumnFilter[] }
    >({
      query: ({ columnFilters }) => ({
        url: `insights/works`,
        method: "POST",
        body: {
          group_by: "lead",
          filters: columnFilters ?? [],
        },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ work_lead_id }) => ({
                type: "WorksByLead" as const,
                id: work_lead_id,
              })),
              { type: "WorksByLead", id: "LIST" },
            ]
          : [{ type: "WorksByLead", id: "LIST" }],
    }),
    getWorksByStaff: builder.query<
      WorkByStaff[],
      { columnFilters?: ColumnFilter[] }
    >({
      query: ({ columnFilters }) => ({
        url: `insights/works`,
        method: "POST",
        body: {
          group_by: "staff",
          filters: columnFilters ?? [],
        },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ staff_id }) => ({
                type: "WorksByStaff" as const,
                id: staff_id,
              })),
              { type: "WorksByStaff", id: "LIST" },
            ]
          : [{ type: "WorksByStaff", id: "LIST" }],
    }),
    getWorksByYearOpened: builder.query<
      WorkByYear[],
      { columnFilters?: ColumnFilter[] }
    >({
      query: ({ columnFilters }) => ({
        url: `insights/works`,
        method: "POST",
        body: {
          group_by: "year_opened",
          filters: columnFilters ?? [],
        },
      }),
    }),
    getWorksByYearCompleted: builder.query<
      WorkByYear[],
      { columnFilters?: ColumnFilter[] }
    >({
      query: ({ columnFilters }) => ({
        url: `insights/works`,
        method: "POST",
        body: {
          group_by: "year_completed",
          filters: columnFilters ?? [],
        },
      }),
    }),
    getWorkClosureBreakdown: builder.query<
      WorkStateByYear[],
      { columnFilters?: ColumnFilter[] }
    >({
      query: ({ columnFilters }) => ({
        url: `insights/works`,
        method: "POST",
        body: {
          group_by: "work_closure_breakdown",
          filters: columnFilters ?? [],
        },
      }),
    }),
  }),
  refetchOnMountOrArgChange: 300,
});

export const {
  useGetWorksByTypeQuery,
  useGetWorksQuery,
  useGetWorksByTeamQuery,
  useGetWorksByLeadQuery,
  useGetWorkByMinistryQuery,
  useGetWorksByFederalInvolvementQuery,
  useGetWorksByNationQuery,
  useGetWorksByStaffQuery,
  useGetWorksWithNationsQuery,
  useGetAssessmentsByPhaseQuery,
  useGetWorksByYearOpenedQuery,
  useGetWorksByYearCompletedQuery,
  useGetWorkClosureBreakdownQuery,
  useGetAllWorksQuery,
} = workInsightsApi;
