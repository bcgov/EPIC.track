import InsightAccordion from "components/insights/InsightsAccordion";
import { Grid } from "@mui/material";
import TrendWorkPhaseListing from "./Charts/TrendWorkPhaseListing";
import PercentOfPhasesWithOveragesChart from "./Charts/PercentOfPhasesWithOverages";
import PhaseInsightUnderageToggle from "../../PhaseUnderageToggle";
import { useState } from "react";

const Trends = () => {
  const [viewUnderage, setViewUnderage] = useState(false);
  return (
    <InsightAccordion
      title="Trends Insights"
      showMoreLabel={true}
      showMoreContent={<TrendWorkPhaseListing />}
      defaultExpanded={false}
      data-cy="trend-phase-accordion"
    >
      <PhaseInsightUnderageToggle
        checked={viewUnderage}
        handleToggle={setViewUnderage}
      />
      <Grid container spacing={2}>
        <Grid className="chart-item" item xs={12}>
          <PercentOfPhasesWithOveragesChart isUnderageToggled={viewUnderage} />
        </Grid>
      </Grid>
    </InsightAccordion>
  );
};

export default Trends;
