import React from "react";
import {
  InsightsAccordion,
  InsightsAccordionCollapsableDetails,
  InsightsAccordionDetails,
  InsightsAccordionSummary,
} from "../InsightsAccordion";
import { ETCaption3, ETParagraph } from "components/shared";
import { Grid, Stack } from "@mui/material";
import ChartsContainer from "./ChartsContainer";

const ProjectInsights = () => {
  const [expanded, setExpanded] = React.useState(false);
  return (
    <InsightsAccordion
      expanded={expanded}
      onClick={() => setExpanded(!expanded)}
    >
      <InsightsAccordionSummary>
        <Stack direction="row" spacing={1} alignItems={"center"}>
          <ETParagraph bold>Project Dashboard</ETParagraph>
          <ETCaption3>
            (visualization of every in progress EAO Project)
          </ETCaption3>
        </Stack>
      </InsightsAccordionSummary>
      <InsightsAccordionDetails>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <ChartsContainer />
          </Grid>
        </Grid>
      </InsightsAccordionDetails>
    </InsightsAccordion>
  );
};

export default ProjectInsights;
