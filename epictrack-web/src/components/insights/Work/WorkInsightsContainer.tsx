import { Grid } from "@mui/material";
import WorkInsightsTabs from "./Tabs";

const WorkInsightsContainer = () => {
  return (
    <Grid container>
      <Grid item xs={12}>
        <WorkInsightsTabs />
      </Grid>
    </Grid>
  );
};

export default WorkInsightsContainer;
