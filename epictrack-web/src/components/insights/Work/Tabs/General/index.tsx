import React from "react";
import { Grid } from "@mui/material";
import { InsightsAccordionCollapsableDetails } from "components/insights/InsightsAccordion";
import WorkByType from "./charts/WorkByType";
import AssessmentByPhase from "./charts/AssessmentByPhase";
import WorkList from "./charts/workListing";

const General = () => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={6}>
        <WorkByType />
      </Grid>
      <Grid item xs={6}>
        <AssessmentByPhase />
      </Grid>
      <Grid item xs={12}>
        <InsightsAccordionCollapsableDetails>
          <WorkList />
        </InsightsAccordionCollapsableDetails>
      </Grid>
    </Grid>
  );
};

export default General;
