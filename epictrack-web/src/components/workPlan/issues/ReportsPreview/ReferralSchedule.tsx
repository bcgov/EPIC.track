import React from "react";
import {
  GrayBox,
  ETPreviewBox,
  ETPreviewText,
  ETSubhead,
  ETCaption2,
} from "../../../shared";
import { Grid, Stack } from "@mui/material";
import { Palette } from "../../../../styles/theme";
import { WorkplanContext } from "../../WorkPlanContext";
import { Else, If, Then } from "react-if";
import moment from "moment";

export const ReferralSchedule = () => {
  const { work, workPhases, issues } = React.useContext(WorkplanContext);

  const currentWorkPhase = workPhases.find(
    (workPhase) => workPhase.work_phase.phase.id === work?.current_phase_id
  );

  const activeApprovedIssues = issues.filter(
    (issue) => Boolean(issue.is_approved) && issue.is_active
  );

  const latestIssue = activeApprovedIssues?.[0];
  return (
    <GrayBox>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <ETSubhead
            sx={{
              color: Palette.primary.main,
            }}
            bold
          >
            Referral Schedule
          </ETSubhead>
        </Grid>
        <Grid item xs={12}>
          <Stack spacing={1}>
            <ETCaption2 bold color={Palette.neutral.light}>
              Project Description (Auto-System Generated)
            </ETCaption2>
            <ETPreviewText>{work?.project.description}</ETPreviewText>
          </Stack>
        </Grid>
        <Grid item xs={12}></Grid>
        <Grid item xs={12}>
          <ETPreviewText>
            {work?.project.name} is in {currentWorkPhase?.work_phase.name}
          </ETPreviewText>
        </Grid>

        <Grid item xs={12}>
          <ETCaption2 bold mb={"0.5em"}>
            Issues{" "}
            {latestIssue?.updated_at
              ? `(${moment(latestIssue?.updated_at).format("MMM.DD YYYY")})`
              : ""}
          </ETCaption2>
          <ETPreviewBox>
            <If condition={activeApprovedIssues.length > 0}>
              <Then>
                <Stack spacing={2} direction="column">
                  {activeApprovedIssues.map((issue) => (
                    <ETPreviewText color={Palette.neutral.dark}>
                      {issue?.updates?.[issue.updates.length - 1]?.description}
                    </ETPreviewText>
                  ))}
                </Stack>
              </Then>
              <Else>
                <ETPreviewText color={Palette.neutral.light}>
                  Your Issues will appear here.
                </ETPreviewText>
              </Else>
            </If>
          </ETPreviewBox>
        </Grid>
      </Grid>
    </GrayBox>
  );
};
