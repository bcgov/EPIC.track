import React from "react";
import {
  GrayBox,
  ETPreviewBox,
  ETPreviewText,
  ETSubhead,
  ETCaption2,
} from "../../../../shared";
import { Grid, Stack } from "@mui/material";
import { Palette } from "../../../../../styles/theme";
import { WorkplanContext } from "../../../WorkPlanContext";
import { Else, If, Then, When } from "react-if";
import moment from "moment";
import { MONTH_DAY_YEAR } from "../../../../../constants/application-constant";

export const ThirtySixtyNinety = () => {
  const { work, workPhases, issues, statuses } =
    React.useContext(WorkplanContext);

  const approvedStatuses = statuses.filter((status) => status.is_approved);
  const currentStatus = approvedStatuses[0];

  const currentWorkPhase = workPhases.find(
    (workPhase) => workPhase.work_phase.id === work?.current_work_phase_id
  );

  const activeApprovedHighprioIssues = issues.filter(
    (issue) =>
      issue.is_active &&
      issue.is_high_priority &&
      issue.updates.find((update) => update.is_approved)
  );

  const issueUpdates = activeApprovedHighprioIssues
    .map((issue) => {
      const update = issue.updates.find((update) => update.is_approved);
      if (!update) return null;

      return {
        issueTitle: issue.title,
        ...update,
      };
    })
    .filter((update) => Boolean(update));

  const latestIssue = activeApprovedHighprioIssues?.[0];

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
            30-60-90 Preview
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
        <Grid item xs={12}>
          <ETCaption2 bold mb={"0.5em"}>
            Status{" "}
            {currentStatus?.posted_date
              ? `(${moment(currentStatus?.posted_date).format(MONTH_DAY_YEAR)})`
              : ""}
          </ETCaption2>
          <ETPreviewBox>
            <If condition={approvedStatuses.length > 0}>
              <Then>
                <ETPreviewText color={Palette.neutral.dark}>
                  {currentStatus?.description}
                </ETPreviewText>
              </Then>
              <Else>
                <ETPreviewText color={Palette.neutral.light}>
                  Your Status will appear here.
                </ETPreviewText>
              </Else>
            </If>
          </ETPreviewBox>
        </Grid>

        <When condition={Boolean(issueUpdates.length > 0)}>
          <Grid item xs={12}>
            <ETCaption2 bold color={Palette.neutral.light}>
              {`Issue (${moment(latestIssue?.updated_at)
                .format("MMM.DD YYYY")
                .toUpperCase()})`}
            </ETCaption2>
            <Stack spacing={2} direction="column">
              {issueUpdates.map((issueUpdate) => (
                <>
                  <ETPreviewText key={`title-${issueUpdate?.id}`} bold>
                    {issueUpdate?.issueTitle}
                  </ETPreviewText>
                  <ETPreviewText key={`description-${issueUpdate?.id}`}>
                    {issueUpdate?.description}
                  </ETPreviewText>
                </>
              ))}
            </Stack>
          </Grid>
        </When>
      </Grid>
    </GrayBox>
  );
};
