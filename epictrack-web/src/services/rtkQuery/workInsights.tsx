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
} from "models/insights";
import { prepareHeaders } from "./util";
import { Work } from "models/work";

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
  ],
  reducerPath: "workInsightsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: AppConfig.apiUrl,
    prepareHeaders,
  }),
  endpoints: (builder) => ({
    getAssessmentsByPhase: builder.query<AssessmentByPhase[], void>({
      query: () => `insights/works?group_by=assessment_by_phase`,
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
    getWorks: builder.query<Work[], void>({
      query: () => `works?is_active=true`,
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
    getWorksByType: builder.query<WorkByType[], void>({
      query: () => `insights/works?group_by=type`,
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
    getWorkByMinistry: builder.query<WorkByMinistry[], void>({
      query: () => `insights/works?group_by=ministry`,
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
      void
    >({
      query: () => `insights/works?group_by=federal_involvement`,
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
    getWorksByNation: builder.query<WorkByNation[], void>({
      query: () => `insights/works?group_by=first_nation`,
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
    getWorksByTeam: builder.query<WorkByTeam[], void>({
      query: () => `insights/works?group_by=team`,
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
    getWorksByLead: builder.query<WorkByLead[], void>({
      query: () => `insights/works?group_by=lead`,
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
    getWorksByStaff: builder.query<WorkByStaff[], void>({
      query: () => `insights/works?group_by=staff`,
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
} = workInsightsApi;
