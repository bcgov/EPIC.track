import { useContext } from "react";
import { Grid } from "@mui/material";
import { NameFilter } from "./NameFilter";
import { TeamFilter } from "./TeamFilter";
import { WorkTypeFilter } from "./WorkType";
import { ProjectTypeFilter } from "./ProjectTypeFilter";
import { WorkStateFilter } from "./WorkStateFilter";
import { EnvRegionFilter } from "./EnvRegionFilter";
import { ResetToDefault } from "./ResetToDefault";
import {
  MyWorkplansContext,
  workplanDefaultFilters,
} from "../MyWorkPlanContext";
import { Unless } from "react-if";
import { SortByFilter } from "./SortByFilter";

const Filters = () => {
  const { searchOptions } = useContext(MyWorkplansContext);

  const isDefaultOptions =
    JSON.stringify(searchOptions) ===
    JSON.stringify({ ...searchOptions, ...workplanDefaultFilters });
  return (
    <Grid
      container
      spacing={2}
      justifyContent={"space-between"}
      direction="row"
    >
      <Grid item xs={3}>
        <NameFilter />
      </Grid>
      <Grid item xs container spacing={2} justifyContent="flex-end">
        <Grid item xs>
          <TeamFilter />
        </Grid>
        <Grid item xs>
          <WorkTypeFilter />
        </Grid>
        <Grid item xs>
          <ProjectTypeFilter />
        </Grid>
        <Grid item xs>
          <EnvRegionFilter />
        </Grid>
        <Grid item xs>
          <WorkStateFilter />
        </Grid>
        <Grid item xs="auto">
          <SortByFilter />
        </Grid>
        <Unless condition={isDefaultOptions}>
          <Grid item xs={"auto"}>
            <ResetToDefault />
          </Grid>
        </Unless>
      </Grid>
    </Grid>
  );
};

export default Filters;
