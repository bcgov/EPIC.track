import { Grid } from "@mui/material";
import { InsightsAccordionCollapsableDetails } from "components/insights/InsightsAccordion";
import WorksCreatedEachYear from "./charts/WorksCreatedEachYear";
import WorksCompletedEachYear from "./charts/WorksCompletedEachYear";
import WorksClosedYearlyBreakdown from "./charts/WorksClosedYearlyBreakdown";
import WorkList from "./charts/WorkListing";

const Trends = () => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={4}>
        <WorksCreatedEachYear />
      </Grid>
      <Grid item xs={4}>
        <WorksCompletedEachYear />
      </Grid>
      <Grid item xs={4}>
        <WorksClosedYearlyBreakdown />
      </Grid>
      <Grid item xs={12}>
        <InsightsAccordionCollapsableDetails>
          <WorkList />
        </InsightsAccordionCollapsableDetails>
      </Grid>
    </Grid>
  );
};

export default Trends;
