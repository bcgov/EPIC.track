export interface UserAuthentication {
    authenticated: boolean;
    loading: boolean;
}
export interface UserState {
    bearerToken: string | undefined;
    authentication: UserAuthentication;
    isAuthorized: boolean;
}