import InsightAccordion from "components/insights/InsightsAccordion";
import { Grid } from "@mui/material";
import MedianPhaseOverageChart from "./Charts/MedianPhaseOverage";
import GeneralWorkPhaseListing from "./Charts/GeneralWorkPhaseListing";
import OverageResponsibilityChart from "./Charts/OverageResponsibility";
import MedianPhaseOverageByWorktypeChart from "./Charts/MedianPhaseOverageByWorktype";

const General = () => (
  <InsightAccordion
    title="General Insights"
    showMoreLabel={true}
    showMoreContent={<GeneralWorkPhaseListing />}
    defaultExpanded={true}
    data-cy="general-phase-accordion"
  >
    <Grid container spacing={2}>
      <Grid className="chart-item" item xs={8}>
        <MedianPhaseOverageChart />
      </Grid>
      <Grid className="chart-item" item xs={4}>
        <OverageResponsibilityChart />
      </Grid>
      <Grid className="chart-item" item xs={12}>
        <MedianPhaseOverageByWorktypeChart />
      </Grid>
    </Grid>
  </InsightAccordion>
);

export default General;
