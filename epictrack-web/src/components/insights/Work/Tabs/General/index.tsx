import InsightAccordion from "components/insights/InsightsAccordion";
import { Grid } from "@mui/material";
import WorkList from "./charts/workListing";
import WorkByType from "./charts/WorkByType";
import AssessmentByPhase from "./charts/AssessmentByPhase";

const WorkAccordion = () => (
  <InsightAccordion
    tab="Work"
    title="General Insights"
    showMoreLabel={true}
    showMoreContent={<WorkList />}
    defaultExpanded={true}
    data-cy="general-work-accordion"
  >
    <Grid container spacing={2}>
      <Grid className="chart-item" item xs={6}>
        <WorkByType />
      </Grid>
      <Grid className="chart-item" item xs={6}>
        <AssessmentByPhase />
      </Grid>
    </Grid>
  </InsightAccordion>
);

export default WorkAccordion;
