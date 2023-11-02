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
    WORK_TYPES: "projects/:project_id/work-types",
    FIRST_NATIONS: "projects/:project_id/first-nations",
    FIRST_NATION_AVAILABLE: "projects/:project_id/first-nation-available",
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
    CHECK_TEMPLATE_UPLOAD_STATUS: "works/work-phases/:work_phase_id",
    WORK_FIRST_NATION_NOTES: "works/:work_id/first-nation-notes",
    WORK_FIRST_NATIONS: "works/:work_id/first-nations",
    DOWNLOAD_WORK_FIRST_NATIONS: "works/:work_id/first-nations/download",
    WORK_FIRST_NATION: "works/first-nations/:work_first_nation_id",
    WORK_IMPORT_FIRST_NATIONS: "works/:work_id/first-nations/import",
  },
  WorkStatuses: {
    WORK_STATUSES: "work-statuses/:work_id",
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
  OutcomeConfigurations: {
    CONFIGURATIONS: "/outcome-configurations",
  },
  ActSections: {
    ACT_SECTIONS: "/act-sections",
  },
};
export default Endpoints;
