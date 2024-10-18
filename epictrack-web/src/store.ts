import { configureStore } from "@reduxjs/toolkit";
import userSlice from "./services/userService/userSlice";
import { setupListeners } from "@reduxjs/toolkit/query";
import uiStateSlice from "./styles/uiStateSlice";
import loadingSlice from "./services/loadingService";
import { projectInsightsApi } from "services/rtkQuery/projectInsights";
import { workInsightsApi } from "services/rtkQuery/workInsights";
import { workStaffInsightsApi } from "services/rtkQuery/workStaffInsights";

export const store = configureStore({
  reducer: {
    user: userSlice,
    uiState: uiStateSlice,
    loadingState: loadingSlice,
    [projectInsightsApi.reducerPath]: projectInsightsApi.reducer,
    [workInsightsApi.reducerPath]: workInsightsApi.reducer,
    [workStaffInsightsApi.reducerPath]: workStaffInsightsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    })
      .concat(projectInsightsApi.middleware)
      .concat(workInsightsApi.middleware)
      .concat(workStaffInsightsApi.middleware),
});

// optional, but required for refetchOnFocus/refetchOnReconnect behaviors
// see `setupListeners` docs - takes an optional callback as the 2nd arg for customization
setupListeners(store.dispatch);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
