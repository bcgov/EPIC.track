declare global {
  interface ImportMeta {
    env: Record<string, string | undefined>;
  }

  interface ImportMetaEnv extends Record<string, string | undefined> {}

  interface Window {
    _env_?: {
      VITE_API_URL?: string;
      VITE_APP_URL?: string;
      VITE_KEYCLOAK_URL?: string;
      VITE_KEYCLOAK_CLIENT?: string;
      VITE_KEYCLOAK_REALM?: string;
      VITE_APP_ENV?: string;
      VITE_APP_VERSION?: string;
      VITE_CENTRE_API_URL?: string;
    };
  }
}

const getEnvValue = (key: string) => {
  return window._env_?.[key] || import.meta.env[key] || "";
};

const API_URL = getEnvValue("VITE_API_URL");
const APP_URL = getEnvValue("VITE_APP_URL");

// Keycloak Environment Variables
const KC_URL = getEnvValue("VITE_KEYCLOAK_URL");
const KC_CLIENT = getEnvValue("VITE_KEYCLOAK_CLIENT");
const KC_REALM = getEnvValue("VITE_KEYCLOAK_REALM");
const APP_ENVIRONMENT = getEnvValue("VITE_APP_ENV");
const APP_VERSION = getEnvValue("VITE_APP_VERSION");
const CENTRE_API_URL = getEnvValue("VITE_CENTRE_API_URL");

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
