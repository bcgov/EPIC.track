const Endpoints = {
  Reports: {
    GET_REPORT: "reports",
    GET_PDF_REPORT: "reports/file",
  },
  Staffs: {
    STAFFS: "staffs",
  },
  Projects: {
    PROJECTS: "projects",
  },
  Codes: {
    GET_CODES: "codes",
  },
  IndigenousNations: {
    INDIGENOUS_NATIONS: "indigenous-nations",
  },
  Proponents: {
    PROPONENTS: "proponents",
  },
  Works: {
    WORKS: "works",
    WORK_RESOURCES: "works/resources",
    DOWNLOAD_WORK_PLAN: "works/workplan/download",
    WORK_TEAM_MEMBERS: "works/:work_id/staff-roles",
    WORK_TEAM_MEMBER: "works/staff-roles/:work_staff_id",
    CHECK_TEMPLATE_UPLOAD_STATUS: "works/:work_id/phase/:phase_id",
  },
  SubTypes: {
    SUB_TYPES: "sub-types",
  },
  Phases: {
    PHASES: "phases",
  },
  Users: {
    USERS: "users",
    GET_USER_GROUPS: "users/groups",
    UPDATE_USER_GROUPS: "users/:userId/groups",
  },
  Templates: {
    TEMPLATES: "task-templates",
  },
  Events: {
    MILESTONE_EVENTS: "milestones",
  },
  TaskEvents: {
    EVENTS: "tasks/events",
    TASKS: "tasks",
  },
  Configurations: {
    CONFIGURATIONS: "/event-configurations",
  },
  Responsibilities: {
    RESPONSIBILITIES: "/responsibilities",
  },
};
export default Endpoints;
