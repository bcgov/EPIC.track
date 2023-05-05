export const Routes = [
  { name: "Home", path: "/", base: "/" },
  {
    name: "Data Management",
    path: "/engagements",
    base: "/data-management",
    routes: [
      {
        name: "Staff",
        path: "/data-management/staffs",
        base: "/data-management/staffs",
      },
      {
        name: "Indigenous Nations",
        path: "/data-management/indigenous-nations",
        base: "/data-management/indigenous-nations",
      },
      {
        name: "Proponents",
        path: "/data-management/proponents",
        base: "/data-management/proponents",
      },
      {
        name: "Projects",
        path: "/data-management/projects",
        base: "/data-management/projects",
      },
    ],
  },
  { name: "Works", path: "/works", base: "/works" },
  {
    name: "Reporting",
    path: "/reporting",
    base: "/reporting",
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
        name: "Thirty Sixty Ninety",
        path: "/reporting/thirty-sixty-ninety",
        base: "/reporting/thirty-sixty-ninety",
      },
    ],
  },
];
