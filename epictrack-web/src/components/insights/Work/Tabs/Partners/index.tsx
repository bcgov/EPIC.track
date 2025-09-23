import { Grid } from "@mui/material";
import InsightAccordion from "components/insights/InsightsAccordion";
import WorkByOtherMinistryChart from "./charts/WorkByOtherMinistry";
import WorkByFederalInvolvementChart from "./charts/WorkByFederalInvolvement";
import WorkByNationChart from "./charts/WorkByNation";
import WorkList from "./charts/WorkList";

const Partners = () => {
  return (
    <InsightAccordion
      title="Partners Insights"
      showMoreLabel={true}
      showMoreContent={<WorkList />}
      defaultExpanded={false}
      data-cy="partner-work-accordion"
    >
      <Grid item xs={4}>
        <WorkByOtherMinistryChart />
      </Grid>
      <Grid item xs={4}>
        <WorkByFederalInvolvementChart />
      </Grid>
      <Grid item xs={4}>
        <WorkByNationChart />
      </Grid>
    </InsightAccordion>
  );
};

export default Partners;
