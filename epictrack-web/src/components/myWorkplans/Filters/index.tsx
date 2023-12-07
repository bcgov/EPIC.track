import React from "react";
import { Grid } from "@mui/material";
import { NameFilter } from "./NameFilter";
import { TeamFilter } from "./TeamFilter";
import { WorkTypeFilter } from "./WorkType";
import { ProjectTypeFilter } from "./ProjectTypeFilter";
import { WorkStateFilter } from "./WorkStateFilter";
import { EnvRegionFilter } from "./EnvRegionFilter";

const Filters = () => {
  return (
    <Grid
      container
      spacing={2}
      justifyContent={"space-between"}
      direction="row"
    >
      <Grid item>
        <NameFilter />
      </Grid>
      <Grid item xs container spacing={2} justifyContent="flex-end">
        <Grid item>
          <TeamFilter />
        </Grid>
        <Grid item>
          <WorkTypeFilter />
        </Grid>
        <Grid item>
          <ProjectTypeFilter />
        </Grid>
        <Grid item>
          <EnvRegionFilter />
        </Grid>
        <Grid item>
          <WorkStateFilter />
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Filters;
