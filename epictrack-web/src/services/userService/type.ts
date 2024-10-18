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
  firstName: string;
  lastName: string;
  email: string;
  staffId: number;
  position: string;
  phone: string;
  roles: string[];
  constructor(
    sub: string,
    preferred_username: string,
    groups: string[],
    firstName: string,
    lastName: string,
    email: string,
    staffId: number,
    phone: string,
    position: string,
    roles: string[]
  ) {
    this.sub = sub;
    this.preferred_username = preferred_username;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.staffId = staffId;
    this.phone = phone;
    this.position = position;
    this.groups = groups.map((p) => p.substring(1, p.length));
    this.roles = roles;
  }
}
