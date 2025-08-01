import { OptionType } from "components/shared/filterSelect/type";
import { StatusFilters } from "./myStatuses/MyStatusContext";
import { IssueFilters } from "./myIssues/MyIssuesContext";

export const MY_UPDATES_TABS = {
  STATUS: {
    label: "Statuses",
    index: 0,
  },
  ISSUES: {
    label: "Issues",
    index: 1,
  },
};

export const isActiveOptions: OptionType[] = [
  {
    label: "Active",
    value: "true",
  },
  {
    label: "Inactive",
    value: "false",
  },
];

export const MY_ISSUES_FILTERS: { [key in keyof IssueFilters]: string } = {
  issue_state: "my-issues-state",
  teams: "my-issues-teams",
  regions: "my-issues-regions",
  work_types: "my-issues-work-types",
  text: "my-issues-text",
  is_approved: "my-issues-approval",
  staleness: "my-issues-staleness",
};

export const MY_ISSUES_CACHED_SEARCH_OPTIONS = "my-issues-search-options";

export const MY_STATUS_FILTERS: { [key in keyof StatusFilters]: string } = {
  teams: "my-status-teams",
  work_is_active: "my-status-work-status",
  regions: "my-status-regions",
  project_is_active: "my-status-project-status",
  work_types: "my-status-work-types",
  text: "my-status-text",
  is_approved: "my-status-approval",
  staleness: "my-status-staleness",
};

export const MY_STATUS_CACHED_SEARCH_OPTIONS = "my-status-search-options";
