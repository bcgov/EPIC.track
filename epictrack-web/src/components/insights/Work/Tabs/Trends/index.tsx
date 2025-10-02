import { Grid } from "@mui/material";
import InsightAccordion from "components/insights/InsightsAccordion";
import WorksCreatedEachYear from "./charts/WorksCreatedEachYear";
import WorksCompletedEachYear from "./charts/WorksCompletedEachYear";
import WorksClosedYearlyBreakdown from "./charts/WorksClosedYearlyBreakdown";
import WorkList from "./charts/WorkListing";

const Trends = () => {
  return (
    <InsightAccordion
      tab="Work"
      title="Trends Insights"
      showMoreLabel={true}
      showMoreContent={<WorkList />}
      defaultExpanded={false}
      data-cy="trend-work-accordion"
    >
      <Grid container spacing={2}>
        <Grid className="chart-item" item xs={4}>
          <WorksCreatedEachYear />
        </Grid>
        <Grid className="chart-item" item xs={4}>
          <WorksCompletedEachYear />
        </Grid>
        <Grid className="chart-item" item xs={4}>
          <WorksClosedYearlyBreakdown />
        </Grid>
      </Grid>
    </InsightAccordion>
  );
};

export default Trends;
