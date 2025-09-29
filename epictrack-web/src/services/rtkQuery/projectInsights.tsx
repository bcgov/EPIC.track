import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { AppConfig } from "config";
import { prepareHeaders } from "./util";
import { ProjectBySubtype, ProjectByType } from "models/insights";
import { Project } from "models/project";
import { ColumnFilter } from "components/shared/MasterTrackTable/type";

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
    getProjects: builder.query<
      Project[],
      { is_active?: boolean; staffId?: number } | void
    >({
      query: (
        args: { is_active?: boolean; staffId?: number } = { is_active: true }
      ) => {
        const { is_active = true, staffId } = args;
        let url = `projects?is_active=${is_active}`;
        if (staffId !== undefined) {
          url += `&staff_id=${staffId}`;
        }
        return url;
      },
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
    getProjectByType: builder.query<
      ProjectByType[],
      { columnFilters?: ColumnFilter[]; staffId?: number }
    >({
      query: ({ columnFilters, staffId }) => ({
        url: `insights/projects`,
        method: "POST",
        body: {
          group_by: "type",
          filters: columnFilters ?? [],
          ...(staffId !== undefined && { staff_id: staffId }),
        },
      }),
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
    getProjectBySubType: builder.query<
      ProjectBySubtype[],
      { type_id: number; columnFilters?: ColumnFilter[]; staffId?: number }
    >({
      query: ({
        type_id,
        columnFilters,
        staffId,
      }: {
        type_id: number;
        columnFilters?: ColumnFilter[];
        staffId?: number;
      }) => ({
        url: `insights/projects`,
        method: "POST",
        body: {
          group_by: "subtype",
          type_id: type_id,
          filters: columnFilters ?? [],
          ...(staffId !== undefined && { staff_id: staffId }),
        },
      }),
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
