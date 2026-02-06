declare global {
  interface Window {
    _env_: {
      REACT_APP_API_URL: string;
      REACT_APP_URL: string;

      // Keycloak
      REACT_APP_KEYCLOAK_URL: string;
      REACT_APP_KEYCLOAK_CLIENT: string;
      REACT_APP_KEYCLOAK_REALM: string;
      REACT_APP_ENV: string;
      REACT_APP_VERSION: string;
      REACT_APP_CENTRE_API_URL: string;
    };
  }
}
const API_URL =
  window._env_?.REACT_APP_API_URL || process.env.REACT_APP_API_URL || "";
const APP_URL = window._env_?.REACT_APP_URL || process.env.REACT_APP_URL || "";

// Keycloak Environment Variables
const KC_URL =
  window._env_?.REACT_APP_KEYCLOAK_URL || process.env.REACT_APP_KEYCLOAK_URL;
const KC_CLIENT =
  window._env_?.REACT_APP_KEYCLOAK_CLIENT ||
  process.env.REACT_APP_KEYCLOAK_CLIENT;
const KC_REALM =
  window._env_?.REACT_APP_KEYCLOAK_REALM ||
  process.env.REACT_APP_KEYCLOAK_REALM;
const APP_ENVIRONMENT =
  window._env_?.REACT_APP_ENV || process.env.REACT_APP_ENV || "";
const APP_VERSION =
  window._env_?.REACT_APP_VERSION || process.env.REACT_APP_VERSION || "";
const CENTRE_API_URL =
  window._env_?.REACT_APP_CENTRE_API_URL ||
  process.env.REACT_APP_CENTRE_API_URL ||
  "";

export const AppConfig = {
  apiUrl: `${API_URL}/api/v1/`,
  appUrl: APP_URL,
  environment: APP_ENVIRONMENT,
  version: APP_VERSION,
  centreApiUrl: CENTRE_API_URL,
  keycloak: {
    url: KC_URL || "",
    clientId: KC_CLIENT || "",
    realm: KC_REALM || "",
  },
};
