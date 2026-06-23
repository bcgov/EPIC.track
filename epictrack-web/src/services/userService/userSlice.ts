import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { UserDetail, UserState } from "./type";
import staffElevatedRoleService from "services/staffElevatedRoleService/staffElevatedRoleService";

const initialState: UserState = {
  bearerToken: "",
  authentication: {
    authenticated: false,
    loading: true,
  },
  isAuthorized: false,
  userDetail: {
    sub: "",
    groups: [],
    preferred_username: "",
    firstName: "",
    lastName: "",
    email: "",
    staffId: 0,
    phone: "",
    position: "",
    roles: [],
  },
  elevatedRoles: [],
  elevatedRolesStatus: "idle",
};

export const fetchElevatedRoles = createAsyncThunk(
  "user/fetchElevatedRoles",
  async (staffId: string) => {
    try {
      const response =
        await staffElevatedRoleService.getActiveStaffElevatedRoleByStaffId(
          staffId,
        );
      return response.data.map((role) => role.elevated_role_id);
    } catch (error) {
      if ((error as AxiosError).response?.status === 404) {
        return []; // no elevated roles assigned — not a failure
      }
      throw error; // anything else hits .rejected
    }
  },
);

export const userSlice = createSlice({
  name: "user",
  initialState: initialState,
  reducers: {
    userToken: (state, action: PayloadAction<string | undefined>) => {
      state.bearerToken = action.payload;
    },
    userAuthorization: (state, action: PayloadAction<boolean>) => {
      state.isAuthorized = action.payload;
    },
    userAuthentication: (state, action: PayloadAction<boolean>) => {
      state.authentication = {
        authenticated: action.payload,
        loading: false,
      };
    },
    userDetails: (state, action: PayloadAction<UserDetail>) => {
      state.userDetail = action.payload;
    },
    noElevatedRoles: (state) => {
      state.elevatedRoles = [];
      state.elevatedRolesStatus = "succeeded";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchElevatedRoles.pending, (state) => {
        state.elevatedRolesStatus = "loading";
      })
      .addCase(fetchElevatedRoles.fulfilled, (state, action) => {
        state.elevatedRoles = action.payload;
        state.elevatedRolesStatus = "succeeded";
      })
      .addCase(fetchElevatedRoles.rejected, (state) => {
        state.elevatedRoles = [];
        state.elevatedRolesStatus = "failed";
      });
  },
});
// Action creators are generated for each case reducer function
export const {
  userToken,
  userAuthorization,
  userAuthentication,
  userDetails,
  noElevatedRoles,
} = userSlice.actions;

export default userSlice.reducer;
