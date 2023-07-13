export const Routes: RouteType[] = [
  {
    name: "All Works",
    icon: "ListIcon",
    path: "/works",
    base: "/works",
  },
  {
    name: "My Workplans",
    icon: "DashboardIcon",
    path: "/",
    base: "/",
  },
  {
    name: "Reports",
    icon: "ReportIcon",
    path: "/reports",
    base: "/reports",
    routes: [
      {
        name: "Referral Schedule",
        path: "/reporting/referral-schedule",
        base: "/reporting/referral-schedule",
      },
      {
        name: "Resource Forecast",
        path: "/reporting/resource-forecast",
        base: "/reporting/resource-forecast",
      },
      {
        name: "30-60-90",
        path: "/reporting/30-60-90",
        base: "/reporting/30-60-90",
      },
    ],
  },
  {
    name: "List Management",
    icon: "SettingsIcon",
    path: "/list-management",
    base: "/list-management",
    routes: [
      {
        name: "Staff",
        path: "/list-management/staffs",
        base: "/list-management/staffs",
      },
      {
        name: "Indigenous Nations",
        path: "/list-management/indigenous-nations",
        base: "/list-management/indigenous-nations",
      },
      {
        name: "Proponents",
        path: "/list-management/proponents",
        base: "/list-management/proponents",
      },
      {
        name: "Projects",
        path: "/list-management/projects",
        base: "/list-management/projects",
      },
    ],
  },
  { name: "Templates", path: "/templates", base: "/templates" },
  { name: "Work Staffing", path: "/workstaffing", base: "/workstaffing" },
  {
    name: "Admin",
    path: "/admin",
    base: "/admin",
    routes: [
      {
        name: "Users",
        path: "/admin/users",
        base: "/admin/users",
      },
    ],
  },
];

export interface RouteType {
  name: string;
  path: string;
  base: string;
  icon?: string;
  routes?: RouteType[];
}
