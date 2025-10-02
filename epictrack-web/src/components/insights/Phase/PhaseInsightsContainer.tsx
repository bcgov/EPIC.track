import { Grid } from "@mui/material";
import PhaseInsightsTabs from "./Tabs";

const PhaseInsightsContainer = () => {
  return (
    <Grid container>
      <Grid item xs={12}>
        <PhaseInsightsTabs />
      </Grid>
    </Grid>
  );
};

export default PhaseInsightsContainer;
