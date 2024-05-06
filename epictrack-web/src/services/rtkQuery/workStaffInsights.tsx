// worksApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { AppConfig } from "config";
import { prepareHeaders } from "./util";
import Endpoints from "constants/api-endpoint";
import { WorkStaff } from "models/workStaff";

export const workStaffInsightsApi = createApi({
  tagTypes: ["WorkStaff"],
  reducerPath: "workStaffInsightsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: AppConfig.apiUrl,
    prepareHeaders,
  }),
  endpoints: (builder) => ({
    getWorkStaffs: builder.query<WorkStaff[], void>({
      query: () => Endpoints.Works.WORK_RESOURCES_ACTIVE,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: "WorkStaff" as const,
                id,
              })),
              { type: "WorkStaff", id: "LIST" },
            ]
          : [{ type: "WorkStaff", id: "LIST" }],
    }),
  }),
  refetchOnMountOrArgChange: 300,
});

export const { useGetWorkStaffsQuery } = workStaffInsightsApi;
