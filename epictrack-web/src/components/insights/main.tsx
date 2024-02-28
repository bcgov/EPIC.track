import React from "react";
import { Grid } from "@mui/material";
import { ETPageContainer } from "components/shared";
import WorkInsights from "./Work";

const Main = () => {
  return (
    <ETPageContainer>
      <Grid container direction="row" spacing={3}>
        <Grid item xs={12}>
          <WorkInsights />
        </Grid>
      </Grid>
    </ETPageContainer>
  );
};

export default Main;
