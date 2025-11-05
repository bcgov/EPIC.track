import { Grid } from "@mui/material";
import ProjectBySubtype from "./ProjectBySubtype";
import ProjectByType from "./ProjectByType";
import ProjectList from "./ProjectListing";
import InsightAccordion from "../InsightsAccordion";

const ProjectInsights = () => {
  return (
    <InsightAccordion
      tab="Project"
      title="General Insights"
      showMoreLabel={true}
      showMoreContent={<ProjectList />}
      defaultExpanded={true}
      data-cy="project-accordion"
    >
      <Grid container spacing={2}>
        <Grid className="chart-item" item xs={6}>
          <ProjectByType />
        </Grid>
        <Grid className="chart-item" item xs={6}>
          <ProjectBySubtype />
        </Grid>
      </Grid>
    </InsightAccordion>
  );
};

export default ProjectInsights;
