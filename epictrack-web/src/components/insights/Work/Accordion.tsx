import React from "react";
import {
  InsightsAccordion,
  InsightsAccordionDetails,
  InsightsAccordionSummary,
} from "../InsightsAccordion";
import { ETCaption3, ETParagraph } from "components/shared";
import { Grid, Stack } from "@mui/material";
import ButtonBar from "./ButtonBar";
import WorkInsightsTabs from "./Tabs";

const WorkAccordion = () => {
  const [expanded, setExpanded] = React.useState(false);
  return (
    <InsightsAccordion
      expanded={expanded}
      onClick={() => setExpanded(!expanded)}
    >
      <InsightsAccordionSummary>
        <Stack direction="row" spacing={1} alignItems={"center"}>
          <ETParagraph bold>Work Dashboard</ETParagraph>
          <ETCaption3>(visualization of every in progress EAO Work)</ETCaption3>
        </Stack>
      </InsightsAccordionSummary>
      <InsightsAccordionDetails>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <ButtonBar />
          </Grid>
          <Grid item xs={12}>
            <WorkInsightsTabs />
          </Grid>
        </Grid>
      </InsightsAccordionDetails>
    </InsightsAccordion>
  );
};

export default WorkAccordion;
