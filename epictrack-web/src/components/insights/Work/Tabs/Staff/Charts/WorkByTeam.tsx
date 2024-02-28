import React from "react";
import { Grid } from "@mui/material";
import { ETCaption1, ETCaption3, GrayBox } from "components/shared";

const WorkByTeam = () => {
  return (
    <GrayBox>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <ETCaption1 bold>WORK BY TEAM</ETCaption1>
        </Grid>
        <Grid item xs={12}>
          <ETCaption3>
            The proportion of active Works categorized by Teams
          </ETCaption3>
        </Grid>
      </Grid>
    </GrayBox>
  );
};

export default WorkByTeam;
