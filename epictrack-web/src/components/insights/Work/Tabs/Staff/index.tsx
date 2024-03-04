import React from "react";
import { Grid } from "@mui/material";
import WorkByTeam from "./Charts/WorkByTeam";
import { InsightsAccordionCollapsableDetails } from "components/insights/InsightsAccordion";

const Staff = () => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={4}>
        <WorkByTeam />
      </Grid>
      <Grid item xs={12}>
        <InsightsAccordionCollapsableDetails>
          <p>
            This is the staff tab. It will contain information about the staff
            and their work.
          </p>
        </InsightsAccordionCollapsableDetails>
      </Grid>
    </Grid>
  );
};

export default Staff;
