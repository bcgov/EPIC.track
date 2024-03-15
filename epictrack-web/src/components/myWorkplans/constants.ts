import { WorkPlanFilters } from "./MyWorkPlanContext";

export const MY_WORKLAN_FILTERS: { [key in keyof WorkPlanFilters]: string } = {
  teams: "my-workplan-teams",
  work_states: "my-workplan-work-states",
  regions: "my-workplan-regions",
  project_types: "my-workplan-project-types",
  work_types: "my-workplan-work-types",
  text: "my-workplan-text",
};

export const MY_WORKPLAN_CACHED_SEARCH_OPTIONS = "my-workplan-search-options";
