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

export const ReferralSchedule = () => {
  const { work, workPhases } = React.useContext(WorkplanContext);

  const currentWorkPhase = workPhases.find(
    (workPhase) => workPhase.work_phase.phase.id === work?.current_phase_id
  );
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
            Issues
          </ETCaption2>
          <ETPreviewBox>
            <ETPreviewText color={Palette.neutral.light}>
              Your Issues will appear here.
            </ETPreviewText>
          </ETPreviewBox>
        </Grid>
      </Grid>
    </GrayBox>
  );
};
