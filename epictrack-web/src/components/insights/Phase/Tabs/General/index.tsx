import InsightAccordion from "components/insights/InsightsAccordion";
import { Grid } from "@mui/material";
import MedianPhaseOverageChart from "./Charts/MedianPhaseOverage";
import GeneralWorkPhaseListing from "./Charts/GeneralWorkPhaseListing";
import OverageResponsibilityChart from "./Charts/OverageResponsibility";
import MedianPhaseOverageByWorktypeChart from "./Charts/MedianPhaseOverageByWorktype";
import { useState } from "react";

const General = () => {
  const [viewUnderage, setViewUnderage] = useState(false);
  return (
    <InsightAccordion
      title="General Insights"
      showMoreLabel={true}
      showMoreContent={<GeneralWorkPhaseListing />}
      defaultExpanded={true}
      data-cy="general-phase-accordion"
      phaseInsights={true}
      viewPhaseUnderage={viewUnderage}
      setViewPhaseUnderage={setViewUnderage}
    >
      <Grid container spacing={2}>
        <Grid className="chart-item" item xs={8}>
          <MedianPhaseOverageChart isUnderageToggled={viewUnderage} />
        </Grid>
        <Grid className="chart-item" item xs={4}>
          <OverageResponsibilityChart isUnderageToggled={viewUnderage} />
        </Grid>
        <Grid className="chart-item" item xs={12}>
          <MedianPhaseOverageByWorktypeChart isUnderageToggled={viewUnderage} />
        </Grid>
      </Grid>
    </InsightAccordion>
  );
};

export default General;
