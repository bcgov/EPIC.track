import React from "react";
import {
  InsightsAccordion,
  InsightsAccordionCollapsableDetails,
  InsightsAccordionDetails,
  InsightsAccordionSummary,
} from "../InsightsAccordion";
import { ETCaption3, ETParagraph } from "components/shared";
import { ButtonGroup, Grid, Stack } from "@mui/material";
import ButtonBar from "./ButtonBar";
import WorkByTeam from "./Tabs/Staff/Charts/WorkByTeam";
import Staff from "./Tabs/Staff";
import WorkInsightsTabs from "./Tabs";

const WorkAccordion = () => {
  const [expanded, setExpanded] = React.useState(true);
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
      <InsightsAccordionCollapsableDetails sx={{ marginTop: "1em" }}>
        // TODO: This is a placeholder for the actual content
        <ETParagraph>
          The Work Dashboard is a visualization of every in progress EAO Work.
          It is a tool that allows EAO to track the progress of ongoing work,
          and to identify where resources may need to be shifted to meet
          deadlines.
        </ETParagraph>
      </InsightsAccordionCollapsableDetails>
    </InsightsAccordion>
  );
};

export default WorkAccordion;
