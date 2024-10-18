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
import { Else, If, Then, When } from "react-if";
import moment from "moment";
import { MONTH_DAY_YEAR } from "../../../../constants/application-constant";

export const ReferralSchedule = () => {
  const { work, workPhases, issues, statuses } =
    React.useContext(WorkplanContext);

  const currentStatus = statuses.find((status) => status.is_approved);

  const currentWorkPhase = workPhases.find(
    (workPhase) => workPhase.work_phase.id === work?.current_work_phase_id
  );

  const activeApprovedIssues = issues.filter(
    (issue) =>
      issue.is_active && issue.updates.find((update) => update.is_approved)
  );

  const issueUpdates = activeApprovedIssues
    .map((issue) => {
      const update = issue.updates.find((update) => update.is_approved);
      if (!update) return null;

      return {
        issueTitle: issue.title,
        ...update,
      };
    })
    .filter((update) => Boolean(update));

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
          <Stack spacing={1} direction="column">
            <ETCaption2 bold color={Palette.neutral.light}>
              Project Description (Auto-System Generated)
            </ETCaption2>
            <ETPreviewText>{work?.project.description}</ETPreviewText>
          </Stack>
        </Grid>
        <Grid item xs={12}>
          <ETPreviewText>
            {work?.project.name} is in {currentWorkPhase?.work_phase.name}
          </ETPreviewText>
        </Grid>

        <Grid item xs={12}>
          <ETCaption2 bold color={Palette.neutral.light}>
            Work Description
          </ETCaption2>
          <ETPreviewText>{work?.report_description}</ETPreviewText>
        </Grid>

        <When condition={Boolean(currentStatus)}>
          <Grid item xs={12}>
            <ETCaption2 bold color={Palette.neutral.light}>
              {`Status (${moment(currentStatus?.posted_date)
                .format("MMM.DD YYYY")
                .toUpperCase()})`}
            </ETCaption2>
            <ETPreviewText sx={{ whiteSpace: "pre-wrap" }}>
              {currentStatus?.description}
            </ETPreviewText>
          </Grid>
        </When>

        <Grid item xs={12}>
          <ETCaption2 bold mb={"0.5em"}>
            Issues{" "}
            {latestIssue?.updated_at
              ? `(${moment(latestIssue?.updated_at).format(MONTH_DAY_YEAR)})`
              : ""}
          </ETCaption2>
          <ETPreviewBox>
            <If condition={activeApprovedIssues.length > 0}>
              <Then>
                <Stack spacing={2} direction="column">
                  {issueUpdates.map((issueUpdate) => (
                    <>
                      <ETPreviewText
                        key={`title-${issueUpdate?.id}`}
                        color={Palette.neutral.dark}
                        bold
                      >
                        {issueUpdate?.issueTitle}
                      </ETPreviewText>
                      <ETPreviewText
                        key={`description-${issueUpdate?.id}`}
                        color={Palette.neutral.dark}
                      >
                        {issueUpdate?.description}
                      </ETPreviewText>
                    </>
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
