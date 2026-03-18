import InsightAccordion from "components/insights/InsightsAccordion";
import { Grid } from "@mui/material";
import TrendWorkPhaseListing from "./Charts/TrendWorkPhaseListing";
import PercentOfPhasesWithOveragesChart from "./Charts/PercentOfPhasesWithOverages";
import { usePhaseInsightsContext } from "../../PhaseInsightsContext";

const Trends = () => {
  const { viewUnderage, setViewUnderage } = usePhaseInsightsContext();
  return (
    <InsightAccordion
      title="Trends Insights"
      showMoreLabel={true}
      showMoreContent={<TrendWorkPhaseListing />}
      defaultExpanded={false}
      data-cy="trend-phase-accordion"
      phaseInsights={true}
      viewPhaseUnderage={viewUnderage}
      setViewPhaseUnderage={setViewUnderage}
    >
      <Grid container spacing={2}>
        <Grid className="chart-item" item xs={12}>
          <PercentOfPhasesWithOveragesChart />
        </Grid>
      </Grid>
    </InsightAccordion>
  );
};

export default Trends;
