// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { AppConfig } from "config";
import { AssessmentByPhase, WorkByType } from "models/insights";
import { prepareHeaders } from "./util";
import { Work } from "models/work";

// Define a service using a base URL and expected endpoints
export const insightsApi = createApi({
  tagTypes: ["Works"],
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
  }),
  keepUnusedDataFor: 300, // in seconds, 300 seconds = 5 minutes
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useGetWorksByTypeQuery,
  useGetAssessmentsByPhaseQuery,
  useGetWorksQuery,
} = insightsApi;
