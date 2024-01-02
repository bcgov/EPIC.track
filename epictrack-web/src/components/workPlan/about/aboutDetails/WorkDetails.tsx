import { Divider, Grid } from "@mui/material";
import { useContext } from "react";
import { WorkplanContext } from "../../WorkPlanContext";
import { ETCaption1, ETCaption2, GrayBox } from "../../../shared";
import { Palette } from "../../../../styles/theme";
import dayjs from "dayjs";
import { MONTH_DAY_YEAR } from "../../../../constants/application-constant";

const WorkDetails = () => {
  const { work, workPhases } = useContext(WorkplanContext);

  const currentWorkPhase = workPhases?.find(
    (phase) => phase.work_phase.id === work?.current_work_phase_id
  );

  return (
    <GrayBox>
      <Grid
        container
        sx={{
          padding: "16px 24px",
        }}
      >
        <Grid item xs={12}>
          <ETCaption1 color={Palette.neutral.main}>WORK START DATE</ETCaption1>
        </Grid>
        <Grid item xs={12}>
          <ETCaption2 color={Palette.neutral.dark}>
            {dayjs(work?.created_at).format(MONTH_DAY_YEAR)}
          </ETCaption2>
        </Grid>
      </Grid>
      <Divider style={{ width: "100%" }} />
      <Grid
        container
        spacing={1}
        sx={{
          padding: "16px 24px",
        }}
      >
        <Grid item xs={12}>
          <ETCaption1 bold color={Palette.primary.main}>
            ANTICIPATED REFERRAL DATE
          </ETCaption1>
        </Grid>
        <Grid item xs={12}>
          <ETCaption2 color={Palette.neutral.dark}>
            {work?.anticipated_decision_date ?? "-"}
          </ETCaption2>
        </Grid>
        <Grid item xs={6}>
          <ETCaption1 bold color={Palette.primary.main}>
            CURRENT MILESTONE
          </ETCaption1>
        </Grid>
        <Grid item xs={6}>
          <ETCaption1 bold color={Palette.primary.main}>
            NEXT MILESTONE
          </ETCaption1>
        </Grid>

        <Grid item xs={6}>
          <ETCaption1 color={Palette.neutral.dark}>
            {currentWorkPhase?.current_milestone ?? "-"}
          </ETCaption1>
        </Grid>

        <Grid item xs={6}>
          <ETCaption1 color={Palette.neutral.dark}>
            {currentWorkPhase?.next_milestone ?? "-"}
          </ETCaption1>
        </Grid>
        <Grid item xs={4}>
          <ETCaption1 bold color={Palette.primary.main}>
            EA ACT
          </ETCaption1>
        </Grid>
        <Grid item xs={4}>
          <ETCaption1 bold color={Palette.primary.main}>
            FEDERAL INVOLVEMENT
          </ETCaption1>
        </Grid>
        <Grid item xs={4}>
          <ETCaption1 bold color={Palette.primary.main}>
            FEDERAL ACT
          </ETCaption1>
        </Grid>
        <Grid item xs={4}>
          <ETCaption1 color={Palette.neutral.dark}>
            {work?.ea_act?.name}
          </ETCaption1>
        </Grid>
        <Grid item xs={4}>
          <ETCaption1 color={Palette.neutral.dark}>
            {work?.federal_involvement?.name}
          </ETCaption1>
        </Grid>
        <Grid item xs={4}>
          <ETCaption1 color={Palette.neutral.dark}>
            {work?.substitution_act?.name}
          </ETCaption1>
        </Grid>
        <Grid item xs={12}>
          <ETCaption1 bold color={Palette.primary.main}>
            RESPONSIBLE MINISTRY
          </ETCaption1>
        </Grid>
        <Grid item xs={12}>
          <ETCaption2 color={Palette.neutral.dark}>
            {work?.ministry?.name}
          </ETCaption2>
        </Grid>
        <Grid item xs={12}>
          <ETCaption1 bold color={Palette.primary.main}>
            DECISION MAKER
          </ETCaption1>
        </Grid>
        <Grid item xs={12}>
          <ETCaption2 color={Palette.neutral.dark}>
            {work?.decision_by?.full_name}
          </ETCaption2>
        </Grid>
      </Grid>
    </GrayBox>
  );
};

export default WorkDetails;
