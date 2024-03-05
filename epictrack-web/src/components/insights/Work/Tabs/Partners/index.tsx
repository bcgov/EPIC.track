import React from "react";
import { Grid } from "@mui/material";
import { InsightsAccordionCollapsableDetails } from "components/insights/InsightsAccordion";
import WorkByOtherMinistryChart from "./charts/WorkByOtherMinistry";
import WorkByFederalInvolvementChart from "./charts/WorkByFederalInvolvement";
import WorkByNationChart from "./charts/WorkByNation";

const Partners = () => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={4}>
        <WorkByOtherMinistryChart />
      </Grid>
      <Grid item xs={4}>
        <WorkByFederalInvolvementChart />
      </Grid>
      <Grid item xs={4}>
        <WorkByNationChart />
      </Grid>
      <Grid item xs={12}>
        <InsightsAccordionCollapsableDetails>
          {/* <WorkList /> */}
        </InsightsAccordionCollapsableDetails>
      </Grid>
    </Grid>
  );
};

export default Partners;
