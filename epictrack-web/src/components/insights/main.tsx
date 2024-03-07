import React from "react";
import { Grid } from "@mui/material";
import { ETPageContainer } from "components/shared";
import WorkInsights from "./Work";
import ProjectInsights from "./Project";

const Main = () => {
  return (
    <ETPageContainer>
      <Grid container direction="row" spacing={3}>
        <Grid item xs={12}>
          <WorkInsights />
        </Grid>
        <Grid item xs={12}>
          <ProjectInsights />
        </Grid>
      </Grid>
    </ETPageContainer>
  );
};

export default Main;
