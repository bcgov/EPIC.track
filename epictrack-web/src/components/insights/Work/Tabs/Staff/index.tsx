import { Grid } from "@mui/material";
import React from "react";
import WorkByTeam from "./Charts/WorkByTeam";

const Staff = () => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={4}>
        <WorkByTeam />
      </Grid>
    </Grid>
  );
};

export default Staff;
