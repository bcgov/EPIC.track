import { ETHeading3 } from "components/shared";
import { Grid, Stack } from "@mui/material";
import WorkInsightsTabs from "./Tabs";
import { Palette } from "styles/theme";

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
