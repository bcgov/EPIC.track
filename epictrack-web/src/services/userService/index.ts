import { AppConfig } from "../../config";
import Keycloak from "keycloak-js";
import { Action, AnyAction, Dispatch } from "redux";
import { userToken, userAuthentication } from "./userSlice";
const KeycloakData: Keycloak = new Keycloak({
  clientId: AppConfig.keycloak.clientId,
  realm: AppConfig.keycloak.realm,
  url: AppConfig.keycloak.url,
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

const UserService = {
  keycloakData: KeycloakData,
  initKeycloak,
  getToken,
  doLogin,
  doLogout,
};

export default UserService;
