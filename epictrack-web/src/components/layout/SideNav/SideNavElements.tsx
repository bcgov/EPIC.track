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
    hasNested: false,
  },
  {
    name: "All Works",
    icon: "AllIcon",
    path: "/works",
    group: "Group1",
    allowedRoles: [],
    isAuthenticated: false,
    hasNested: false,
  },
  {
    name: "Reports",
    icon: "ReportIcon",
    path: "/reports",
    group: "Group2",
    hasNested: true,
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
    group: "Group2",
    allowedRoles: [],
    isAuthenticated: false,
    hasNested: false,
  },
  {
    name: "Task Templates",
    path: "/templates",
    group: "Group3",
    icon: "PenIcon",
    allowedRoles: [],
    isAuthenticated: false,
    hasNested: false,
  },
  {
    name: "List Management",
    icon: "GridIcon",
    path: "/list-management",
    group: "Group3",
    hasNested: true,
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
    group: "Group4",
    hasNested: true,
    routes: [
      {
        name: "Users",
        path: "/admin/users",
        allowedRoles: [ROLES.CREATE],
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
  hasNested?: boolean;
}
