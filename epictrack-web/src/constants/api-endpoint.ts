const Endpoints = {
  Reports: {
    GET_REPORT: "reports",
    GET_PDF_REPORT: "reports/file",
    GET_EVENT_CALENDAR: "reports/event-calendar",
  },
  Staffs: {
    STAFFS: "staffs",
  },
  Projects: {
    PROJECTS: "projects",
    WORK_TYPES: "projects/:project_id/work-types",
    FIRST_NATIONS: "projects/:project_id/first-nations",
    FIRST_NATION_AVAILABLE: "projects/:project_id/first-nation-available",
    PROJECT_ABBREVIATION: "projects/abbreviation",
  },
  ProjectTypes: {
    GET_ALL: "project-types",
  },
  Codes: {
    GET_CODES: "codes",
  },
  IndigenousNations: {
    INDIGENOUS_NATIONS: "indigenous-nations",
  },
  IndigenousNationsConsultationLevels: {
    GET_ALL: "indigenous-nations-consultation-levels",
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
    WORK_NOTES: "works/:work_id/notes",
    WORK_FIRST_NATIONS: "works/:work_id/first-nations",
    DOWNLOAD_WORK_FIRST_NATIONS: "works/:work_id/first-nations/download",
    WORK_FIRST_NATION: "works/first-nations/:work_first_nation_id",
    WORK_IMPORT_FIRST_NATIONS: "works/:work_id/first-nations/import",
    GET_ALL_WORK_TYPES: "works/types",
  },
  WorkTypes: {
    GET_ALL: "work-types",
  },
  WorkIssues: {
    ISSUES: "work/:work_id/issues",
    EDIT_ISSUE: "work/:work_id/issues/:issue_id",
    EDIT_ISSUE_UPDATE: "work/:work_id/issues/:issue_id/update/:issue_update_id",
    APPROVE_ISSUE_UPDATE:
      "work/:work_id/issues/:issue_id/update/:issue_update_id/approve",
    CLONE_UPDATE: "work/:work_id/issues/:issue_id/update",
  },
  WorkStatuses: {
    WORK_STATUSES: "work/:work_id/statuses",
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
  Workplan: {
    GET_ALL: "/works/dashboard",
  },
  EAO_TEAMS: {
    GET_ALL: "/eao-teams",
  },
  REGION: {
    GET_ALL: "/regions",
  },
  Position: {
    GET_ALL: "positions",
  },
  SpecialFields: {
    SPECIAL_FIELDS: "/special-fields",
    UPDATE: "/special-fields/:specialFieldId",
  },
};
export default Endpoints;
