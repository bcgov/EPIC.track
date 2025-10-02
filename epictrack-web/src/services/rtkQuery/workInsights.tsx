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

type InsightQueryArgs = {
  columnFilters?: ColumnFilter[];
  staffId?: number;
};

function buildInsightBody(
  groupBy: string,
  { columnFilters, staffId }: InsightQueryArgs
) {
  return {
    group_by: groupBy,
    filters: columnFilters ?? [],
    ...(staffId !== undefined && { staff_id: staffId }),
  };
}

function buildQueryString(
  base: string,
  { is_active, staffId }: { is_active?: boolean; staffId?: number } = {}
): string {
  const params: string[] = [];

  if (is_active !== undefined) {
    params.push(`is_active=${is_active}`);
  }
  if (staffId !== undefined) {
    params.push(`staff_id=${staffId}`);
  }

  return params.length ? `${base}?${params.join("&")}` : base;
}

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
    getAssessmentsByPhase: builder.query<AssessmentByPhase[], InsightQueryArgs>(
      {
        query: (args) => ({
          url: `insights/works`,
          method: "POST",
          body: buildInsightBody("assessment_by_phase", args),
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
      }
    ),

    getAllWorks: builder.query<
      Work[],
      { is_active?: boolean; staffId?: number } | void
    >({
      query: (
        args: { is_active?: boolean; staffId?: number } = { is_active: true }
      ) => buildQueryString("works", args),
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
      { is_active?: boolean; staffId?: number } | void
    >({
      query: (
        args: { is_active?: boolean; staffId?: number } = { is_active: true }
      ) => buildQueryString("works", args),
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

    getWorksByType: builder.query<WorkByType[], InsightQueryArgs>({
      query: (args) => ({
        url: `insights/works`,
        method: "POST",
        body: buildInsightBody("type", args),
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

    getWorksWithNations: builder.query<Work[], { staffId?: number } | void>({
      query: (args) =>
        buildQueryString("works", { ...args, is_active: true }) +
        "&include_indigenous_nations=true",
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

    getWorkByMinistry: builder.query<WorkByMinistry[], InsightQueryArgs>({
      query: (args) => ({
        url: `insights/works`,
        method: "POST",
        body: buildInsightBody("ministry", args),
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
      InsightQueryArgs
    >({
      query: (args) => ({
        url: `insights/works`,
        method: "POST",
        body: buildInsightBody("federal_involvement", args),
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

    getWorksByNation: builder.query<WorkByNation[], InsightQueryArgs>({
      query: (args) => ({
        url: `insights/works`,
        method: "POST",
        body: buildInsightBody("first_nation", args),
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

    getWorksByTeam: builder.query<WorkByTeam[], InsightQueryArgs>({
      query: (args) => ({
        url: `insights/works`,
        method: "POST",
        body: buildInsightBody("team", args),
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

    getWorksByLead: builder.query<WorkByLead[], InsightQueryArgs>({
      query: (args) => ({
        url: `insights/works`,
        method: "POST",
        body: buildInsightBody("lead", args),
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

    getWorksByStaff: builder.query<WorkByStaff[], InsightQueryArgs>({
      query: (args) => ({
        url: `insights/works`,
        method: "POST",
        body: buildInsightBody("staff", args),
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

    getWorksByYearOpened: builder.query<WorkByYear[], InsightQueryArgs>({
      query: (args) => ({
        url: `insights/works`,
        method: "POST",
        body: buildInsightBody("year_opened", args),
      }),
    }),

    getWorksByYearCompleted: builder.query<WorkByYear[], InsightQueryArgs>({
      query: (args) => ({
        url: `insights/works`,
        method: "POST",
        body: buildInsightBody("year_completed", args),
      }),
    }),

    getWorkClosureBreakdown: builder.query<WorkStateByYear[], InsightQueryArgs>(
      {
        query: (args) => ({
          url: `insights/works`,
          method: "POST",
          body: buildInsightBody("work_closure_breakdown", args),
        }),
      }
    ),
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
