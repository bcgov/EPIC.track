export interface User {
  first_name: string;
  last_name: string;
  email: string;
  id: string;
  group_id: string;
  group: Group;
}

export interface Group {
  id: string;
  name: string;
  path: string;
  level: number;
  display_name: string;
}
