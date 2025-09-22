import { Grid } from "@mui/material";
import WorkByTeam from "./Charts/WorkByTeam";
import InsightAccordion from "components/insights/InsightsAccordion";
import WorkList from "./Charts/workListing";
import WorkByLead from "./Charts/WorkByLead";
import WorkByStaff from "./Charts/WorkByStaff";

const Staff = () => {
  return (
    <InsightAccordion
      title="Staff Insights"
      showMoreLabel={true}
      showMoreContent={<WorkList />}
      defaultExpanded={false}
      data-cy="staff-work-accordion"
    >
      <Grid item xs={4}>
        <WorkByTeam />
      </Grid>
      <Grid item xs={4}>
        <WorkByLead />
      </Grid>
      <Grid item xs={4}>
        <WorkByStaff />
      </Grid>
    </InsightAccordion>
  );
};

export default Staff;
