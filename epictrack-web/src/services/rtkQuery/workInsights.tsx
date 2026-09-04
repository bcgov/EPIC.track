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
  WorkByRel,
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

export type WorkListingScope = {
  is_active?: boolean;
  staffId?: number;
};

export type WorkListingArgs = WorkListingScope & {
  filters?: ColumnFilter[];
  page?: number;
  size?: number;
  sortKey?: string;
  sortOrder?: "asc" | "desc";
  includeIndigenousNations?: boolean;
  includeRelStaff?: boolean;
};

export type WorkListingPage = {
  items: Work[];
  total: number;
};

export type WorkListingFilterOptions = {
  projects: string[];
  work_types: string[];
  phases: string[];
  ministries: string[];
  federal_involvements: string[];
  indigenous_nations: string[];
  rel_staff: string[];
  work_states: string[];
  started_years: string[];
  closed_years: string[];
};

function buildInsightBody(
  groupBy: string,
  { columnFilters, staffId }: InsightQueryArgs,
) {
  return {
    group_by: groupBy,
    filters: columnFilters ?? [],
    ...(staffId !== undefined && { staff_id: staffId }),
  };
}

function buildQueryString(
  base: string,
  {
    is_active,
    staffId,
    context,
  }: { is_active?: boolean; staffId?: number; context?: string } = {},
): string {
  const params: string[] = [];

  if (is_active !== undefined) {
    params.push(`is_active=${is_active}`);
  }
  if (staffId !== undefined) {
    params.push(`staff_id=${staffId}`);
  }
  if (context !== undefined) {
    params.push(`context=${context}`);
  }

  return params.length ? `${base}?${params.join("&")}` : base;
}

export const workInsightsApi = createApi({
  tagTypes: [
    "WorkListing",
    "WorkListingFilterOptions",
    "WorksByStaff",
    "WorksByType",
    "WorksByTeam",
    "WorksByLead",
    "WorksByMinistry",
    "WorksByFederalInvolvement",
    "WorksByNation",
    "WorksByRel",
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
      },
    ),

    getWorksListing: builder.query<WorkListingPage, WorkListingArgs>({
      query: ({
        is_active,
        staffId,
        filters,
        page,
        size,
        sortKey,
        sortOrder,
        includeIndigenousNations,
        includeRelStaff,
      }) => ({
        url: "works/listing",
        method: "POST",
        body: {
          is_active,
          staff_id: staffId,
          filters: filters ?? [],
          page,
          size,
          sort_key: sortKey,
          sort_order: sortOrder ?? "asc",
          include_indigenous_nations: includeIndigenousNations ?? false,
          include_rel_staff: includeRelStaff ?? false,
        },
      }),
      providesTags: [{ type: "WorkListing", id: "LIST" }],
    }),

    getWorkListingFilterOptions: builder.query<
      WorkListingFilterOptions,
      WorkListingScope
    >({
      query: ({ is_active, staffId }) =>
        buildQueryString("works/listing/filter-options", {
          is_active,
          staffId,
        }),
      providesTags: [{ type: "WorkListingFilterOptions", id: "LIST" }],
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

    getWorksByRel: builder.query<WorkByRel[], InsightQueryArgs>({
      query: (args) => ({
        url: `insights/works`,
        method: "POST",
        body: buildInsightBody("rel", args),
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ rel_staff_id }) => ({
                type: "WorksByRel" as const,
                id: rel_staff_id,
              })),
              { type: "WorksByRel", id: "LIST" },
            ]
          : [{ type: "WorksByRel", id: "LIST" }],
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
      },
    ),
  }),
  refetchOnMountOrArgChange: 300,
});

export const {
  useGetWorksByTypeQuery,
  useGetWorksListingQuery,
  useLazyGetWorksListingQuery,
  useGetWorkListingFilterOptionsQuery,
  useGetWorksByTeamQuery,
  useGetWorksByLeadQuery,
  useGetWorkByMinistryQuery,
  useGetWorksByFederalInvolvementQuery,
  useGetWorksByNationQuery,
  useGetWorksByStaffQuery,
  useGetWorksByRelQuery,
  useGetAssessmentsByPhaseQuery,
  useGetWorksByYearOpenedQuery,
  useGetWorksByYearCompletedQuery,
  useGetWorkClosureBreakdownQuery,
} = workInsightsApi;
