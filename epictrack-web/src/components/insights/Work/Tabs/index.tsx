import Staff from "./Staff";
import General from "./General";
import Partners from "./Partners";
import { Grid } from "@mui/material";
import Trends from "./Trends";

const WorkInsightsTabs = () => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <General />
      </Grid>
      <Grid item xs={12}>
        <Staff />
      </Grid>
      <Grid item xs={12}>
        <Partners />
      </Grid>
      <Grid item xs={12}>
        <Trends />
      </Grid>
    </Grid>
  );
};

export default WorkInsightsTabs;
