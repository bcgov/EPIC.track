import { AppConfig, ApiConfig } from "../config";
import { getAccessToken } from "./auth";
import { ApiClient, createApiClient } from "./client";

export interface ApiClients {
  track: ApiClient;
  /** Only when VITE_DEMI_API_URL is set. */
  demi?: ApiClient;
  all: ApiClient[];
}

export const buildApiClients = (apis: ApiConfig): ApiClients => {
  const track = createApiClient({
    name: "track",
    baseURL: apis.track.baseUrl,
    getToken: getAccessToken,
  });
  // Same Keycloak token as Track for now; DEMI may need its own audience or APIM header.
  const demi = apis.demi.baseUrl
    ? createApiClient({
        name: "demi",
        baseURL: apis.demi.baseUrl,
        getToken: getAccessToken,
      })
    : undefined;
  return { track, demi, all: demi ? [track, demi] : [track] };
};

const clients = buildApiClients(AppConfig.apis);

export const trackClient = clients.track;
export const demiClient = clients.demi;
/** For app-wide interceptors (loading state, 429 notice). */
export const apiClients = clients.all;
