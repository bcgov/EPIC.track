import { OptionType } from "components/shared/filterSelect/type";
import { StatusFilters } from "./MyStatusContext";

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
