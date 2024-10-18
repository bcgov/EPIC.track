import { ROLES } from "../../../constants/application-constant";
import { Icon } from "../../icons/type";

export const Routes: RouteType[] = [
  {
    name: "My Workplans",
    icon: "DashboardIcon",
    path: "/",
    group: "Group1",
    allowedRoles: [],
    isAuthenticated: false,
  },
  {
    name: "My Tasks",
    icon: "CheckListIcon",
    path: "/my-tasks",
    group: "Group1",
    allowedRoles: [],
    isAuthenticated: false,
  },
  {
    name: "All Works",
    icon: "AllIcon",
    path: "/works",
    group: "Group2",
    allowedRoles: [],
    isAuthenticated: false,
  },
  {
    name: "Reports",
    icon: "ReportIcon",
    path: "/reports",
    group: "Group3",
    routes: [
      {
        name: "Referral Schedule",
        path: "/reports/referral-schedule",
        allowedRoles: [],
        isAuthenticated: false,
      },
      {
        name: "Resource Forecast",
        path: "/reports/resource-forecast",
        allowedRoles: [],
        isAuthenticated: false,
      },
      {
        name: "30-60-90",
        path: "/reports/30-60-90",
        allowedRoles: [],
        isAuthenticated: false,
      },
      {
        name: "Event Calendar",
        path: "/reports/event-calendar",
        allowedRoles: [],
        isAuthenticated: false,
      },
    ],
  },
  {
    name: "Insights",
    icon: "InsightIcon",
    path: "/insights",
    group: "Group3",
    allowedRoles: [],
    isAuthenticated: false,
  },
  {
    name: "Task Templates",
    path: "/templates",
    group: "Group4",
    icon: "PenIcon",
    allowedRoles: [],
    isAuthenticated: false,
  },
  {
    name: "List Management",
    icon: "GridIcon",
    path: "/list-management",
    group: "Group4",
    routes: [
      {
        name: "Staff",
        path: "/list-management/staffs",
        allowedRoles: [],
        isAuthenticated: false,
      },
      {
        name: "First Nations",
        path: "/list-management/first-nations",
        allowedRoles: [],
        isAuthenticated: false,
      },
      {
        name: "Proponents",
        path: "/list-management/proponents",
        allowedRoles: [],
        isAuthenticated: false,
      },
      {
        name: "Projects",
        path: "/list-management/projects",
        allowedRoles: [],
        isAuthenticated: false,
      },
      {
        name: "Work Staff",
        path: "/list-management/work-staff",
        allowedRoles: [],
        isAuthenticated: false,
      },
    ],
  },
  {
    name: "Admin",
    path: "/admin",
    icon: "GearIcon",
    group: "Group5",
    routes: [
      {
        name: "Users",
        path: "/admin/users",
        allowedRoles: [ROLES.MANAGE_USERS],
        isAuthenticated: true,
      },
    ],
  },
];

export interface RouteType {
  name: string;
  path: string;
  group?: string;
  icon?: Icon;
  routes?: RouteType[];
  allowedRoles?: string[];
  isAuthenticated?: boolean;
}
