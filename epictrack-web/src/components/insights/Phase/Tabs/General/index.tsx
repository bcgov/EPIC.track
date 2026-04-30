import InsightAccordion from "components/insights/InsightsAccordion";
import { Grid } from "@mui/material";
import MedianPhaseOverageChart from "./Charts/MedianPhaseOverage";
import GeneralWorkPhaseListing from "./Charts/GeneralWorkPhaseListing";
import OverageResponsibilityChart from "./Charts/OverageResponsibility";
import MedianPhaseOverageByWorktypeChart from "./Charts/MedianPhaseOverageByWorktype";
import { usePhaseInsightsContext } from "components/insights/Phase/PhaseInsightsContext";

const General = () => {
  const { viewUnderage, setViewUnderage, exportAllPhaseData, isExporting } =
    usePhaseInsightsContext();
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
      onExportAllData={exportAllPhaseData}
      isExportingAllData={isExporting}
    >
      <Grid container spacing={2}>
        <Grid className="chart-item" item xs={12} md={12} lg={8}>
          <MedianPhaseOverageChart />
        </Grid>
        <Grid className="chart-item" item xs={12} md={12} lg={4}>
          <OverageResponsibilityChart />
        </Grid>
        <Grid className="chart-item" item xs={12}>
          <MedianPhaseOverageByWorktypeChart />
        </Grid>
      </Grid>
    </InsightAccordion>
  );
};

export default General;
