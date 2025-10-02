import InsightAccordion from "components/insights/InsightsAccordion";
import { Grid } from "@mui/material";
import PercentOfPhaseOveragesByAct from "./Charts/PercentOfPhaseOveragesByAct";
import PercentOfPhaseOveragesByYear from "./Charts/PercentOfPhaseOveragesByYear";
import TrendWorkPhaseListing from "./Charts/TrendWorkPhaseListing";

const Trends = () => (
  <InsightAccordion
    title="Trends Insights"
    showMoreLabel={true}
    showMoreContent={<TrendWorkPhaseListing />}
    defaultExpanded={false}
    data-cy="trend-phase-accordion"
  >
    <Grid container spacing={2}>
      <Grid className="chart-item" item xs={6}>
        <PercentOfPhaseOveragesByAct />
      </Grid>
      <Grid className="chart-item" item xs={6}>
        <PercentOfPhaseOveragesByYear />
      </Grid>
    </Grid>
  </InsightAccordion>
);

export default Trends;
