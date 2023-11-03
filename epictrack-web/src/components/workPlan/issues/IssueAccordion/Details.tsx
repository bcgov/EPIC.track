import React from "react";
import { Grid } from "@mui/material";
import { WorkIssue } from "../../../../models/Issue";
import { ETCaption1, ETParagraph, GrayBox } from "../../../shared";
import moment from "moment";
import { ErrorChip } from "../../../shared/chip/ETChip";

const IssueDetails = ({ issue }: { issue: WorkIssue }) => {
  const latestUpdate = issue.updates[issue.updates.length - 1];
  return (
    <Grid container spacing={2}>
      <Grid item lg={6} sm={12}>
        <GrayBox>
          <Grid container spacing={2} justifyContent={"space-between"}>
            <Grid item xs={"auto"}>
              <ETCaption1 bold>
                {moment(issue.created_at).format("MMM.DD YYYY")}
              </ETCaption1>
            </Grid>
            <Grid item xs="auto">
              <ErrorChip label="Need Approval" />
            </Grid>

            <Grid item xs={12}>
              <ETParagraph>{latestUpdate?.description}</ETParagraph>
            </Grid>
          </Grid>
        </GrayBox>
      </Grid>
    </Grid>
  );
};

export default IssueDetails;
