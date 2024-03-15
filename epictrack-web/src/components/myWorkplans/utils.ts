import { MY_WORKLAN_FILTERS } from "./constants";

export const getCachedSearchOptions = () => {
  return {
    teams: JSON.parse(sessionStorage.getItem(MY_WORKLAN_FILTERS.teams) || "[]"),
    work_states: JSON.parse(
      sessionStorage.getItem(MY_WORKLAN_FILTERS.work_states) || "[]"
    ),
    regions: JSON.parse(
      sessionStorage.getItem(MY_WORKLAN_FILTERS.regions) || "[]"
    ),
    project_types: JSON.parse(
      sessionStorage.getItem(MY_WORKLAN_FILTERS.project_types) || "[]"
    ),
    work_types: JSON.parse(
      sessionStorage.getItem(MY_WORKLAN_FILTERS.work_types) || "[]"
    ),
  };
};
