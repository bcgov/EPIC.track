export interface UserAuthentication {
  authenticated: boolean;
  loading: boolean;
}
export interface UserDetail {
  sub?: string;
  email_verified?: boolean;
  preferred_username?: string;
  groups?: string[];
}
export interface UserState {
  bearerToken: string | undefined;
  authentication: UserAuthentication;
  isAuthorized: boolean;
  userDetail: UserDetail;
}
export interface UserGroupUpdate {
  existing_group_id: string | undefined | null;
  group_id_to_update: string;
}