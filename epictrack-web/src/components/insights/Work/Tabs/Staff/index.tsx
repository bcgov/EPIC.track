import { Grid } from "@mui/material";
import WorkByTeam from "./Charts/WorkByTeam";
import InsightAccordion from "components/insights/InsightsAccordion";
import WorkList from "./Charts/workListing";
import WorkByLead from "./Charts/WorkByLead";
import WorkByStaff from "./Charts/WorkByStaff";

const Staff = () => {
  return (
    <InsightAccordion
      tab="Work"
      title="Staff Insights"
      showMoreLabel={true}
      showMoreContent={<WorkList />}
      defaultExpanded={false}
      data-cy="staff-work-accordion"
    >
      <Grid container spacing={2} style={{ margin: 0 }}>
        <Grid className="chart-item" item xs={12} md={12} lg={4}>
          <WorkByTeam />
        </Grid>
        <Grid className="chart-item" item xs={12} md={12} lg={4}>
          <WorkByLead />
        </Grid>
        <Grid className="chart-item" item xs={12} md={12} lg={4}>
          <WorkByStaff />
        </Grid>
      </Grid>
    </InsightAccordion>
  );
};

export default Staff;
