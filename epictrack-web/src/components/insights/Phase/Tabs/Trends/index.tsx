import InsightAccordion from "components/insights/InsightsAccordion";
import { Grid } from "@mui/material";
import TrendWorkPhaseListing from "./Charts/TrendWorkPhaseListing";
import PercentOfPhasesWithOveragesChart from "./Charts/PercentOfPhasesWithOverages";

const Trends = () => (
  <InsightAccordion
    title="Trends Insights"
    showMoreLabel={true}
    showMoreContent={<TrendWorkPhaseListing />}
    defaultExpanded={false}
    data-cy="trend-phase-accordion"
  >
    <Grid container spacing={2}>
      <Grid className="chart-item" item xs={12}>
        <PercentOfPhasesWithOveragesChart />
      </Grid>
    </Grid>
  </InsightAccordion>
);

export default Trends;
