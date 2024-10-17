import React, { useContext } from "react";
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
        <Grid item xs={2}>
          <TeamFilter />
        </Grid>
        <Grid item xs={2}>
          <WorkTypeFilter />
        </Grid>
        <Grid item xs={2}>
          <ProjectTypeFilter />
        </Grid>
        <Grid item xs={2}>
          <EnvRegionFilter />
        </Grid>
        <Grid item xs={2}>
          <WorkStateFilter />
        </Grid>
        <Unless condition={isDefaultOptions}>
          <Grid item xs="auto">
            <ResetToDefault />
          </Grid>
        </Unless>
      </Grid>
    </Grid>
  );
};

export default Filters;
