const Endpoints = {
  Reports: {
    GET_REPORT: "reports",
    GET_PDF_REPORT: "reports/file",
    GET_EVENT_CALENDAR: "reports/event-calendar",
  },
  Staffs: {
    STAFFS: "staffs",
  },
  ElevatedRoles: {
    GET_ALL: "elevated-roles",
  },
  StaffsElevatedRoles: {
    STAFF_ELEVATED_ROLES: "staff-elevated-roles",
  },
  Projects: {
    FIRST_NATIONS: "projects/:project_id/first-nations",
    FIRST_NATION_AVAILABLE: "projects/:project_id/first-nation-available",
  },
  IndigenousNations: {
    INDIGENOUS_NATIONS: "indigenous-nations",
    INDIGENOUS_NATIONS_DETAILS: "indigenous-nations/details",
  },
  IndigenousNationsConsultationLevels: {
    GET_ALL: "indigenous-nations-consultation-levels",
  },
  Proponents: {
    PROPONENTS: "proponents",
  },
  Works: {
    WORKS_BY_STAFF: "works/by-staff/:staff_id",
    WORK_RESOURCES: "works/resources",
    WORK_RESOURCES_ACTIVE: "works/resources?is_active=true",
    WORK_TEAM_MEMBERS: "works/:work_id/staff-roles",
    WORK_TEAM_MEMBER: "works/staff-roles/:work_staff_id",
    WORK_FIRST_NATION_NOTES: "works/:work_id/first-nation-notes",
    WORK_NOTES: "works/:work_id/notes",
    WORK_FIRST_NATIONS: "works/:work_id/first-nations",
    DOWNLOAD_WORK_FIRST_NATIONS: "works/:work_id/first-nations/download",
    WORK_FIRST_NATION: "works/first-nations/:work_first_nation_id",
    WORK_IMPORT_FIRST_NATIONS: "works/:work_id/first-nations/import",
  },
  WorkIssues: {
    GET_ALL: "work-issues/dashboard",
    ISSUES: "work/:work_id/issues",
    EDIT_ISSUE: "work/:work_id/issues/:issue_id",
    EDIT_ISSUE_UPDATE: "work/:work_id/issues/:issue_id/update/:issue_update_id",
    APPROVE_ISSUE_UPDATE:
      "work/:work_id/issues/:issue_id/update/:issue_update_id/approve",
    CLONE_UPDATE: "work/:work_id/issues/:issue_id/update",
  },
  WorkStatuses: {
    WORK_STATUSES: "work/:work_id/statuses",
    GET_ALL: "work-statuses/dashboard",
  },
  Responsibilities: {
    RESPONSIBILITIES: "/responsibilities",
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
    DELETE: "/special-fields/:specialFieldId",
  },
  Ministry: {
    MINISTRY: "/ministries",
  },
  EAAct: {
    GET_ALL: "/ea-acts",
  },
  FederalInvolvement: {
    GET_ALL: "/federal-involvements",
  },
  Roles: {
    GET_ALL: "/roles",
  },
  SubstitutionActs: {
    GET_ALL: "/substitution-acts",
  },
  PIPOrgTypes: {
    GET_ALL: "/pip-org-types",
  },
  StalenessSettings: {
    STALENESS_BY_TYPE: "/staleness-settings/:staleness_type",
    STALENESS: "/staleness-settings",
    UPDATE_STALENESS_BY_TYPE: "/staleness-settings/:staleness_type",
  },
  WorkResources: {
    GET_WORK_RESOURCES_BY_WORK: "/work-resources?work_id=:work_id",
    WORK_RESOURCE_BY_ID: "/work-resources/:work_resource_id",
  },
};
export default Endpoints;
