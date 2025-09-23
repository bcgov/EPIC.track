import { Grid } from "@mui/material";
import ProjectBySubtype from "./ProjectBySubtype";
import ProjectByType from "./ProjectByType";
import ProjectList from "./ProjectListing";
import InsightAccordion from "../InsightsAccordion";

const ProjectInsights = () => {
  return (
    <InsightAccordion
      title="General Insights"
      showMoreLabel={true}
      showMoreContent={<ProjectList />}
      defaultExpanded={true}
      data-cy="project-accordion"
    >
      <Grid item xs={6}>
        <ProjectByType />
      </Grid>
      <Grid item xs={6}>
        <ProjectBySubtype />
      </Grid>
    </InsightAccordion>
  );
};

export default ProjectInsights;
