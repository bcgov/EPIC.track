import Keycloak from "keycloak-js";
import { Action, Dispatch } from "redux";
import { AppDispatch } from "../../store";
import {
  userToken,
  userAuthentication,
  userDetails,
  userAuthorization,
  fetchElevatedRoles,
  noElevatedRoles,
} from "./userSlice";
import { AppConfig } from "../../config";
import http from "../../apiManager/http-request-handler";
import Endpoints from "../../constants/api-endpoint";
import { UserDetail } from "./type";
import staffService from "../staffService/staffService";
import { Staff } from "../../models/staff";

// Interface for UserInfo object.
interface UserInfo {
  sub: string;
  preferred_username: string;
  groups: string[];
  given_name: string;
  family_name: string;
  email: string;
}
// Initialize as null to placehold the Keycloak instance for cypress tests.
let KeycloakData: Keycloak | null = null;

const doLogout = () => {
  if (KeycloakData) {
    KeycloakData.logout();
  }
};
let refreshInterval: NodeJS.Timeout;

/**
 * Logout function
 */
const userLogout = () => {
  localStorage.clear();
  sessionStorage.clear();
  clearInterval(refreshInterval);
  doLogout();
};

const refreshToken = (dispatch: Dispatch<Action>) => {
  refreshInterval = setInterval(async () => {
    if (KeycloakData) {
      try {
        const refreshed = await KeycloakData.updateToken(3000);
        if (refreshed) {
          dispatch(userToken(KeycloakData.token));
        }
      } catch (error) {
        console.log(error);
        userLogout();
      }
    }
  }, 60000);
};
/**
 *  Initializes Keycloak instance.
 */
const initKeycloak = async (dispatch: AppDispatch) => {
  if (!KeycloakData) {
    // Initialize Keycloak only if it's not already initialized
    KeycloakData = new Keycloak({
      clientId: AppConfig.keycloak.clientId,
      realm: AppConfig.keycloak.realm,
      url: `${AppConfig.keycloak.url}/auth`,
    });
  }
  try {
    const authenticated = await KeycloakData.init({
      onLoad: "login-required",
      pkceMethod: "S256",
      checkLoginIframe: false,
      redirectUri: `${AppConfig.appUrl}/track`,
    });
    if (!authenticated) {
      console.warn("not authenticated!");
      dispatch(userAuthentication(authenticated));
      return;
    }

    const userInfo: UserInfo = (await KeycloakData.loadUserInfo()) as UserInfo;
    let staffProfile;
    let hasStaffProfile = true;
    try {
      const staffResult = await staffService.getByEmail(userInfo["email"]);
      if (staffResult.status === 200) {
        staffProfile = staffResult.data as Staff;
      }
    } catch (e) {
      if ((e as any).response?.status === 404) {
        console.log("Staff profile not found for current user.");
        hasStaffProfile = false;
      } else console.log(e);
    }
    const realmAccessRoles =
      KeycloakData.tokenParsed?.realm_access?.roles ?? [];
    const clientLevelRoles =
      KeycloakData.tokenParsed?.resource_access?.[AppConfig.keycloak.clientId]
        ?.roles ?? [];
    const roles = [...realmAccessRoles, ...clientLevelRoles];
    const userDetail = new UserDetail(
      userInfo["sub"],
      userInfo["preferred_username"],
      userInfo["groups"],
      userInfo["given_name"],
      userInfo["family_name"],
      userInfo["email"],
      staffProfile?.id ?? 0,
      staffProfile?.phone ?? "",
      staffProfile?.position?.name ?? "",
      roles,
    );
    const isAuthorized = userDetail.groups.some(
      (group) =>
        group.startsWith("TRACK/") &&
        group !== "TRACK" &&
        group !== "TRACK/NO_ROLE",
    );
    dispatch(userAuthorization(isAuthorized));
    dispatch(userDetails(userDetail));
    dispatch(userToken(KeycloakData.token));
    dispatch(userAuthentication(Boolean(KeycloakData.authenticated)));
    // only fetch if we actually found a staff profile
    if (hasStaffProfile && userDetail.staffId) {
      dispatch(fetchElevatedRoles(String(userDetail.staffId)));
    } else {
      dispatch(noElevatedRoles());
    }
    refreshToken(dispatch);
    updateLastActiveTime(userDetail.staffId);
  } catch (err) {
    console.error(err);
    dispatch(userAuthentication(false));
  }
};

const getToken = () =>
  KeycloakData?.token ?? window.localStorage.getItem("authToken");

const doLogin = () => {
  if (KeycloakData) {
    KeycloakData.login();
  }
};

const updateLastActiveTime = async (userId: number) => {
  try {
    await http.PatchRequest(
      `${Endpoints.Staffs.STAFFS}/${userId}/last_active_at`,
    );
  } catch (error) {
    console.error("Error updating last active time:", error);
  }
};

const UserService = {
  keycloakData: KeycloakData,
  initKeycloak,
  getToken,
  doLogin,
  doLogout,
};

export default UserService;
