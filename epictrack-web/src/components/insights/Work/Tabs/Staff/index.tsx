import React from "react";
import { Grid } from "@mui/material";
import WorkByTeam from "./Charts/WorkByTeam";
import { InsightsAccordionCollapsableDetails } from "components/insights/InsightsAccordion";
import WorkList from "./Charts/workListing";
import WorkByLead from "./Charts/WorkByLead";

const Staff = () => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={4}>
        <WorkByTeam />
      </Grid>
      <Grid item xs={4}>
        <WorkByLead />
      </Grid>
      <Grid item xs={4}>
        <WorkByTeam />
      </Grid>
      <Grid item xs={12}>
        <InsightsAccordionCollapsableDetails>
          <WorkList />
        </InsightsAccordionCollapsableDetails>
      </Grid>
    </Grid>
  );
};

export default Staff;
