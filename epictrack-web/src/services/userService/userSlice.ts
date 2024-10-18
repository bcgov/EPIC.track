import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserDetail, UserState } from "./type";

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
};

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
  },
});
// Action creators are generated for each case reducer function
export const { userToken, userAuthorization, userAuthentication, userDetails } =
  userSlice.actions;

export default userSlice.reducer;
