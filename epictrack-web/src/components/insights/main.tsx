import React from "react";
import { Grid, Stack } from "@mui/material";
import { ETCaption3, ETPageContainer, ETParagraph } from "components/shared";
import {
  InsightsAccordion,
  InsightsAccordionCollapsableDetails,
  InsightsAccordionDetails,
  InsightsAccordionSummary,
} from "./InsightsAccordion";

const Main = () => {
  const [expanded, setExpanded] = React.useState(false);
  return (
    <ETPageContainer>
      <Grid container>
        <Grid item xs={12}>
          <InsightsAccordion
            expanded={expanded}
            onClick={() => setExpanded(!expanded)}
          >
            <InsightsAccordionSummary>
              <Stack direction="row" spacing={1} alignItems={"center"}>
                <ETParagraph bold>Work Dashboard</ETParagraph>
                <ETCaption3>
                  (visualization of every in progress EAO Work)
                </ETCaption3>
              </Stack>
            </InsightsAccordionSummary>
            <InsightsAccordionDetails>
              <ETParagraph>
                The Work Dashboard is a visualization of every in progress EAO
                Work. It is a tool that allows EAO to track the progress of
                ongoing work, and to identify where resources may need to be
                shifted to meet deadlines.
              </ETParagraph>
            </InsightsAccordionDetails>
            <InsightsAccordionCollapsableDetails>
              <ETParagraph>
                The Work Dashboard is a visualization of every in progress EAO
                Work. It is a tool that allows EAO to track the progress of
                ongoing work, and to identify where resources may need to be
                shifted to meet deadlines.
              </ETParagraph>
            </InsightsAccordionCollapsableDetails>
          </InsightsAccordion>
        </Grid>
      </Grid>
    </ETPageContainer>
  );
};

export default Main;
