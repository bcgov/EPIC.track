import { Grid } from "@mui/material";
import ProjectInsights from "./ChartsContainer";

const ProjectInsightsContainer = () => {
  return (
    <Grid container>
      <Grid item xs={12}>
        <ProjectInsights data-cy="project-insights-accordion" />
      </Grid>
    </Grid>
  );
};

export default ProjectInsightsContainer;
