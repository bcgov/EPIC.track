import {
  createApi,
  fakeBaseQuery,
  skipToken,
} from "@reduxjs/toolkit/query/react";
import { ApiError, toApiError } from "apiManager/apiError";
import { Project, ProjectInput, ProjectSummary } from "models/project";
import { projectsApi } from "./projectsApi";

export const projectsQueryApi = createApi({
  reducerPath: "projectsQuery",
  baseQuery: fakeBaseQuery<ApiError>(),
  tagTypes: ["Project"],
  endpoints: (builder) => ({
    getProjectSummary: builder.query<ProjectSummary, number>({
      queryFn: async (id) => {
        try {
          return { data: await projectsApi.getSummary(id) };
        } catch (error) {
          return { error: toApiError(error, "projects") };
        }
      },
      providesTags: (_result, _error, id) => [{ type: "Project", id }],
    }),
    updateProject: builder.mutation<
      Project,
      { id: number; input: ProjectInput }
    >({
      queryFn: async ({ id, input }) => {
        try {
          return { data: await projectsApi.update(id, input) };
        } catch (error) {
          return { error: toApiError(error, "projects") };
        }
      },
      invalidatesTags: (_result, error, { id }) =>
        error ? [] : [{ type: "Project", id }],
    }),
  }),
});

/** Cached across screens; refetched after useUpdateProject saves. */
export const useProjectSummary = (projectId?: number) =>
  projectsQueryApi.useGetProjectSummaryQuery(projectId ?? skipToken);

export const useUpdateProject = projectsQueryApi.useUpdateProjectMutation;
