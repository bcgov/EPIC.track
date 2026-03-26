declare global {
  interface ImportMeta {
    env: Record<string, string | undefined>;
  }

  interface ImportMetaEnv extends Record<string, string | undefined> {}

  interface Window {
    _env_?: {
      VITE_API_URL?: string;
      VITE_APP_URL?: string;

      // Keycloak
      VITE_KEYCLOAK_URL?: string;
      VITE_KEYCLOAK_CLIENT?: string;
      VITE_KEYCLOAK_REALM?: string;
      VITE_APP_ENV?: string;
      VITE_APP_VERSION?: string;
      VITE_CENTRE_API_URL?: string;

      // Temporary fallback for legacy runtime configs.
      REACT_APP_API_URL?: string;
      REACT_APP_URL?: string;
      REACT_APP_KEYCLOAK_URL?: string;
      REACT_APP_KEYCLOAK_CLIENT?: string;
      REACT_APP_KEYCLOAK_REALM?: string;
      REACT_APP_ENV?: string;
      REACT_APP_VERSION?: string;
      REACT_APP_CENTRE_API_URL?: string;
    };
  }
}

const getEnvValue = (viteKey: string, legacyKey?: string) => {
  return (
    window._env_?.[viteKey] ||
    (legacyKey ? window._env_?.[legacyKey] : undefined) ||
    import.meta.env[viteKey] ||
    (legacyKey ? import.meta.env[legacyKey] : undefined) ||
    ""
  );
};

const API_URL = getEnvValue("VITE_API_URL", "REACT_APP_API_URL");
const APP_URL = getEnvValue("VITE_APP_URL", "REACT_APP_URL");

// Keycloak Environment Variables
const KC_URL = getEnvValue("VITE_KEYCLOAK_URL", "REACT_APP_KEYCLOAK_URL");
const KC_CLIENT = getEnvValue(
  "VITE_KEYCLOAK_CLIENT",
  "REACT_APP_KEYCLOAK_CLIENT",
);
const KC_REALM = getEnvValue("VITE_KEYCLOAK_REALM", "REACT_APP_KEYCLOAK_REALM");
const APP_ENVIRONMENT = getEnvValue("VITE_APP_ENV", "REACT_APP_ENV");
const APP_VERSION = getEnvValue("VITE_APP_VERSION", "REACT_APP_VERSION");
const CENTRE_API_URL = getEnvValue(
  "VITE_CENTRE_API_URL",
  "REACT_APP_CENTRE_API_URL",
);

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
