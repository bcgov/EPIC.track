import { Grid } from "@mui/material";
import ProjectInsights from "./ChartsContainer";
import { TableFilterProvider } from "../TableFilterContext";

const ProjectInsightsContainer = () => {
  return (
    <Grid container>
      <Grid item xs={12}>
        <TableFilterProvider>
          <ProjectInsights data-cy="project-insights-accordion" />
        </TableFilterProvider>
      </Grid>
    </Grid>
  );
};

export default ProjectInsightsContainer;
