import Keycloak from "keycloak-js";
import { Action, AnyAction, Dispatch } from "redux";
import { userToken, userAuthentication, userDetails } from "./userSlice";
import { AppConfig } from "../../config";
import http from "../../apiManager/http-request-handler";
import Endpoints from "../../constants/api-endpoint";
import { UserDetail, UserGroupUpdate } from "./type";

const KeycloakData: Keycloak = new Keycloak({
  clientId: AppConfig.keycloak.clientId,
  realm: AppConfig.keycloak.realm,
  url: `${AppConfig.keycloak.url}/auth`,
});
const doLogout = KeycloakData.logout;
let refreshInterval: NodeJS.Timer;
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
const initKeycloak = async (dispatch: Dispatch<AnyAction>) => {
  try {
    const authenticated = await KeycloakData.init({
      onLoad: "login-required",
      pkceMethod: "S256",
      checkLoginIframe: false,
    });
    if (!authenticated) {
      console.warn("not authenticated!");
      dispatch(userAuthentication(authenticated));
      return;
    }

    const userInfo: any = await KeycloakData.loadUserInfo();
    const userDetail = new UserDetail(
      userInfo["sub"],
      userInfo["preferred_username"],
      userInfo["groups"]
    );
    dispatch(userDetails(userDetail));
    dispatch(userToken(KeycloakData.token));
    dispatch(userAuthentication(KeycloakData.authenticated ? true : false));
    refreshToken(dispatch);
  } catch (err) {
    console.error(err);
    dispatch(userAuthentication(false));
  }
};

const getToken = () =>
  KeycloakData.token || window.localStorage.getItem("authToken");
const doLogin = () => KeycloakData.login;

// User management service methods
const getUsers = async () => {
  return await http.GetRequest(AppConfig.apiUrl + Endpoints.Users.USERS);
};

const getGroups = async () => {
  return await http.GetRequest(
    AppConfig.apiUrl + Endpoints.Users.GET_USER_GROUPS
  );
};

const updateUserGroup = async (
  userId: string,
  updateUserGroup: UserGroupUpdate
) => {
  return await http.PutRequest(
    AppConfig.apiUrl +
      Endpoints.Users.UPDATE_USER_GROUPS.replace(":userId", userId),
    JSON.stringify(updateUserGroup)
  );
};
const UserService = {
  keycloakData: KeycloakData,
  initKeycloak,
  getToken,
  doLogin,
  doLogout,
  getUsers,
  getGroups,
  updateUserGroup,
};

export default UserService;
