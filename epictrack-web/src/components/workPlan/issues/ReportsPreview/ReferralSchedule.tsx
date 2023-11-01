import React from "react";
import {
  GrayBox,
  ETPreviewBox,
  ETPreviewText,
  ETSubhead,
  ETCaption2,
  ETCaption3,
} from "../../../shared";
import { Grid, Stack } from "@mui/material";
import { Palette } from "../../../../styles/theme";
import { WorkplanContext } from "../../WorkPlanContext";

export const ReferralSchedule = () => {
  const { work, workPhases } = React.useContext(WorkplanContext);

  const currentWorkPhase = workPhases.find(
    (workPhase) => workPhase.phase.id === work?.current_phase_id
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
            30-60-90 Preview
          </ETSubhead>
        </Grid>
        <Grid item xs={12}>
          <Stack spacing={1}>
            <ETCaption2 bold color={Palette.neutral.light}>
              Project Description (Auto-System Generated)
            </ETCaption2>
            <ETCaption3>{work?.project.description}</ETCaption3>
          </Stack>
        </Grid>
        <Grid item xs={12}></Grid>
        <Grid item xs={12}>
          <ETCaption3>
            {work?.project.name} is in {currentWorkPhase?.phase.name}
          </ETCaption3>
        </Grid>

        <Grid item xs={12}>
          <ETCaption2 bold mb={"0.5em"}>
            Issues
          </ETCaption2>
          <ETPreviewBox>
            <ETPreviewText>Your Issues will appear here.</ETPreviewText>
          </ETPreviewBox>
        </Grid>
      </Grid>
    </GrayBox>
  );
};
