import React from "react";
import { Grid } from "@mui/material";
import FilterSelect from "../../shared/filterSelect/FilterSelect";
import { NameFilter } from "./NameFilter";

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
          <FilterSelect
            options={[]}
            variant="inline"
            placeholder="Team"
            filterAppliedCallback={() => {
              return;
            }}
            name="team"
            isMulti
            info={true}
          />
        </Grid>
        <Grid item>
          <FilterSelect
            options={[]}
            variant="inline"
            placeholder="Work Type"
            filterAppliedCallback={() => {
              return;
            }}
            name="work_type"
            isMulti
            info={true}
          />
        </Grid>
        <Grid item>
          <FilterSelect
            options={[]}
            variant="inline"
            placeholder="Project Type"
            filterAppliedCallback={() => {
              return;
            }}
            name="project_type"
            isMulti
            info={true}
          />
        </Grid>
        <Grid item>
          <FilterSelect
            options={[]}
            variant="inline"
            placeholder="ENV Region"
            filterAppliedCallback={() => {
              return;
            }}
            name="env_region"
            isMulti
            info={true}
          />
        </Grid>
        <Grid item>
          <FilterSelect
            options={[]}
            variant="inline"
            placeholder="Work State"
            filterAppliedCallback={() => {
              return;
            }}
            name="work_state"
            isMulti
            info={true}
          />
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Filters;
