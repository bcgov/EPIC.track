// worksApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { AppConfig } from "config";
import { prepareHeaders } from "./util";
import { ProjectBySubtype, ProjectByType } from "models/insights";
import { Project } from "models/project";

export const projectInsightsApi = createApi({
  tagTypes: [
    "Projects",
    "AssessmentsByPhase",
    "ProjectsByType",
    "ProjectsBySubType",
  ],
  reducerPath: "projectInsightsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: AppConfig.apiUrl,
    prepareHeaders,
  }),
  endpoints: (builder) => ({
    getProjects: builder.query<Project[], boolean | void>({
      query: (is_active = true) => `projects?is_active=${is_active}`,
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

export const {
  useGetProjectByTypeQuery,
  useLazyGetProjectBySubTypeQuery,
  useGetProjectsQuery,
} = projectInsightsApi;
