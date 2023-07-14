import { Icon } from "../../icons/type";

export const Routes: RouteType[] = [
  {
    name: "My Workplans",
    icon: "DashboardIcon",
    path: "/",
    group: "Group1",
  },
  {
    name: "All Works",
    icon: "AllIcon",
    path: "/works",
    group: "Group1",
  },
  {
    name: "Reports",
    icon: "ReportIcon",
    path: "/reports",
    group: "Group2",
    routes: [
      {
        name: "Referral Schedule",
        path: "/reporting/referral-schedule",
      },
      {
        name: "Resource Forecast",
        path: "/reporting/resource-forecast",
      },
      {
        name: "30-60-90",
        path: "/reporting/30-60-90",
      },
    ],
  },
  {
    name: "Insights",
    icon: "InsightIcon",
    path: "/insights",
    group: "Group2",
  },
  {
    name: "Templates",
    path: "/templates",
    group: "Group3",
    icon: "PenIcon",
  },
  {
    name: "List Management",
    icon: "GridIcon",
    path: "/list-management",
    group: "Group3",
    routes: [
      {
        name: "Staff",
        path: "/list-management/staffs",
      },
      {
        name: "Indigenous Nations",
        path: "/list-management/indigenous-nations",
      },
      {
        name: "Proponents",
        path: "/list-management/proponents",
      },
      {
        name: "Projects",
        path: "/list-management/projects",
      },
    ],
  },
  {
    name: "Admin",
    path: "/admin",
    icon: "GearIcon",
    group: "Group4",
    routes: [
      {
        name: "Users",
        path: "/admin/users",
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
}
