import InsightAccordion from "components/insights/InsightsAccordion";
import { Grid } from "@mui/material";
import WorkList from "./charts/workListing";
import WorkByType from "./charts/WorkByType";
import AssessmentByPhase from "./charts/AssessmentByPhase";

const WorkAccordion = () => (
  <InsightAccordion
    title="General Insights"
    showMoreLabel={true}
    showMoreContent={<WorkList />}
    defaultExpanded={true}
    data-cy="general-work-accordion"
  >
    <Grid item xs={6}>
      <WorkByType />
    </Grid>
    <Grid item xs={6}>
      <AssessmentByPhase />
    </Grid>
  </InsightAccordion>
);

export default WorkAccordion;
