declare global {
  interface Window {
    _env_: {
      REACT_APP_API_URL: string;

      // Keycloak
      REACT_APP_KEYCLOAK_URL: string;
      REACT_APP_KEYCLOAK_CLIENT: string;
      REACT_APP_KEYCLOAK_REALM: string;
      REACT_APP_ENV: string;
    };
  }
}
const API_URL =
  window._env_?.REACT_APP_API_URL || process.env.REACT_APP_API_URL || "";

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
  window._env_?.REACT_APP_ENV || process.env.REACT_APP_ENV;

export const AppConfig = {
  apiUrl: `${API_URL}/api/v1/`,
  environment: APP_ENVIRONMENT,
  keycloak: {
    url: KC_URL || "",
    clientId: KC_CLIENT || "",
    realm: KC_REALM || "",
  },
};
