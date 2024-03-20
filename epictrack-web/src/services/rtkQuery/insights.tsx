// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { AppConfig } from "config";
import {
  AssessmentByPhase,
  WorkByLead,
  WorkByTeam,
  ProjectBySubtype,
  ProjectByType,
  WorkByFederalInvolvement,
  WorkByMinistry,
  WorkByNation,
  WorkByType,
  WorkByStaff,
} from "models/insights";
import { prepareHeaders } from "./util";
import { Work } from "models/work";
import { Project } from "models/project";

// Define a service using a base URL and expected endpoints
export const insightsApi = createApi({
  tagTypes: [
    "Works",
    "Projects",
    "WorksByStaff",
    "AssessmentsByPhase",
    "ProjectsByType",
    "ProjectsBySubType",
    "WorksByType",
    "WorksByTeam",
    "WorksByLead",
    "WorksByMinistry",
    "WorksByFederalInvolvement",
    "WorksByNation",
    "WorksWithNations",
  ],
  reducerPath: "insightsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: AppConfig.apiUrl,
    prepareHeaders,
  }),
  endpoints: (builder) => ({
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
      query: () => `works`,
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
    getWorksWithNations: builder.query<Work[], void>({
      query: () => `works?include_indigenous_nations=true`,
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
    getProjects: builder.query<Project[], void>({
      query: () => `projects`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: "Projects" as const,
                id,
              })),
              { type: "Projects", id: "LIST" },
            ]
          : [{ type: "Projects", id: "LIST" }],
    }),
    getProjectByType: builder.query<ProjectByType[], void>({
      query: () => `insights/projects?group_by=type`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ type_id }) => ({
                type: "ProjectsByType" as const,
                id: type_id,
              })),
              { type: "ProjectsByType", id: "LIST" },
            ]
          : [{ type: "ProjectsByType", id: "LIST" }],
    }),
    getProjectBySubType: builder.query<ProjectBySubtype[], number>({
      query: (type_id: number) =>
        `insights/projects?group_by=subtype${
          type_id ? `&type_id=${type_id}` : ""
        }`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ sub_type_id }) => ({
                type: "ProjectsBySubType" as const,
                id: sub_type_id,
              })),
              { type: "ProjectsBySubType", id: "LIST" },
            ]
          : [{ type: "ProjectsBySubType", id: "LIST" }],
    }),
  }),

  refetchOnMountOrArgChange: 300,
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useGetWorksByTypeQuery,
  useGetAssessmentsByPhaseQuery,
  useGetWorksQuery,
  useGetWorksByTeamQuery,
  useGetWorksByLeadQuery,
  useGetWorkByMinistryQuery,
  useGetWorksByFederalInvolvementQuery,
  useGetWorksByNationQuery,
  useGetWorksByStaffQuery,
  useGetProjectByTypeQuery,
  useLazyGetProjectBySubTypeQuery,
  useGetProjectsQuery,
  useGetWorksWithNationsQuery,
} = insightsApi;
