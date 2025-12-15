import { Grid } from "@mui/material";
import InsightAccordion from "components/insights/InsightsAccordion";
import WorkByOtherMinistryChart from "./charts/WorkByOtherMinistry";
import WorkByFederalInvolvementChart from "./charts/WorkByFederalInvolvement";
import WorkByNationChart from "./charts/WorkByNation";
import WorkList from "./charts/WorkList";

const Partners = () => {
  return (
    <InsightAccordion
      tab="Work"
      title="Partners Insights"
      showMoreLabel={true}
      showMoreContent={<WorkList />}
      defaultExpanded={false}
      data-cy="partner-work-accordion"
    >
      <Grid container spacing={2} style={{ margin: 0 }}>
        <Grid className="chart-item" item xs={12} md={12} lg={6}>
          <WorkByOtherMinistryChart />
        </Grid>
        <Grid className="chart-item" item xs={12} md={12} lg={6}>
          <WorkByFederalInvolvementChart />
        </Grid>
        <Grid className="chart-item" item xs={12} md={12} lg={6}>
          <WorkByNationChart />
        </Grid>
      </Grid>
    </InsightAccordion>
  );
};

export default Partners;
