// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { AppConfig } from "config";
import {
  AssessmentByPhase,
  ProjectBySubtype,
  ProjectByType,
  WorkByFederalInvolvement,
  WorkByMinistry,
  WorkByNation,
  WorkByType,
} from "models/insights";
import { prepareHeaders } from "./util";
import { Work } from "models/work";
import { Project } from "models/project";

// Define a service using a base URL and expected endpoints
export const insightsApi = createApi({
  tagTypes: ["Works", "Projects"],
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
                type: "Works" as const,
                id: work_type_id,
              })),
              { type: "Works", id: "LIST" },
            ]
          : [{ type: "Works", id: "LIST" }],
    }),
    getAssessmentsByPhase: builder.query<AssessmentByPhase[], void>({
      query: () => `insights/works?group_by=assessment_by_phase`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ phase_id }) => ({
                type: "Works" as const,
                id: phase_id,
              })),
              { type: "Works", id: "LIST" },
            ]
          : [{ type: "Works", id: "LIST" }],
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
    getWorkByMinistry: builder.query<WorkByMinistry[], void>({
      query: () => `insights/works?group_by=ministry`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ ministry_id }) => ({
                type: "Works" as const,
                id: ministry_id,
              })),
              { type: "Works", id: "LIST" },
            ]
          : [{ type: "Works", id: "LIST" }],
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
                type: "Works" as const,
                id: federal_involvement_id,
              })),
              { type: "Works", id: "LIST" },
            ]
          : [{ type: "Works", id: "LIST" }],
    }),
    getWorksByNation: builder.query<WorkByNation[], void>({
      query: () => `insights/works?group_by=first_nation`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ first_nation_id }) => ({
                type: "Works" as const,
                id: first_nation_id,
              })),
              { type: "Works", id: "LIST" },
            ]
          : [{ type: "Works", id: "LIST" }],
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
                type: "Projects" as const,
                id: type_id,
              })),
              { type: "Projects", id: "LIST" },
            ]
          : [{ type: "Projects", id: "LIST" }],
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
                type: "Projects" as const,
                id: sub_type_id,
              })),
              { type: "Projects", id: "LIST" },
            ]
          : [{ type: "Projects", id: "LIST" }],
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
  useGetWorkByMinistryQuery,
  useGetWorksByFederalInvolvementQuery,
  useGetWorksByNationQuery,
  useGetProjectByTypeQuery,
  useLazyGetProjectBySubTypeQuery,
  useGetProjectsQuery,
} = insightsApi;
