import InsightAccordion from "components/insights/InsightsAccordion";
import { Grid } from "@mui/material";
import AveragePhaseOverageChart from "./Charts/AveragePhaseOverage";
import GeneralWorkPhaseListing from "./Charts/GeneralWorkPhaseListing";
import PercentOfPhasesWithOveragesChart from "./Charts/PercentOfPhasesWithOverages";
import OverageResponsibilityChart from "./Charts/OverageResponsibility";

const General = () => (
  <InsightAccordion
    title="General Insights"
    showMoreLabel={true}
    showMoreContent={<GeneralWorkPhaseListing />}
    defaultExpanded={true}
    data-cy="general-phase-accordion"
  >
    <Grid item xs={4}>
      <AveragePhaseOverageChart />
    </Grid>
    <Grid item xs={4}>
      <PercentOfPhasesWithOveragesChart />
    </Grid>
    <Grid item xs={4}>
      <OverageResponsibilityChart />
    </Grid>
  </InsightAccordion>
);

export default General;
