import { Grid } from "@mui/material";
import React from "react";
import ProjectBySubtype from "./ProjectBySubtype";
import ProjectByType from "./ProjectByType";
import ProjectList from "./ProjectListing";
import { InsightsAccordionCollapsableDetails } from "../InsightsAccordion";

const ChartsContainer = () => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={6}>
        <ProjectByType />
      </Grid>
      <Grid item xs={6}>
        <ProjectBySubtype />
      </Grid>
      <Grid item xs={12}>
        <InsightsAccordionCollapsableDetails>
          <ProjectList />
        </InsightsAccordionCollapsableDetails>
      </Grid>
    </Grid>
  );
};

export default ChartsContainer;
