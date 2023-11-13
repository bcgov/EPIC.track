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
        path: "/reports/referral-schedule",
      },
      {
        name: "Resource Forecast",
        path: "/reports/resource-forecast",
      },
      {
        name: "30-60-90",
        path: "/reports/30-60-90",
      },
      {
        name: "Event Calendar",
        path: "/reports/event-calendar",
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
        name: "First Nations",
        path: "/list-management/first-nations",
      },
      {
        name: "Proponents",
        path: "/list-management/proponents",
      },
      {
        name: "Projects",
        path: "/list-management/projects",
      },
      {
        name: "Work Staff",
        path: "/list-management/work-staff",
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
