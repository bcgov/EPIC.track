export interface UserAuthentication {
  authenticated: boolean;
  loading: boolean;
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
export class UserDetail {
  sub: string;
  preferred_username: string;
  groups: string[];
  constructor(sub: string, preferred_username: string, groups: string[]) {
    this.sub = sub;
    this.preferred_username = preferred_username;
    this.groups = groups.map((p) => p.substring(1, p.length));
  }
}
