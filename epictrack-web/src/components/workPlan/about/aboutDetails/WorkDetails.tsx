import { Divider, Grid } from "@mui/material";
import { useContext } from "react";
import { WorkplanContext } from "../../WorkPlanContext";
import { ETCaption1, ETParagraph, GrayBox } from "../../../shared";
import { Palette } from "../../../../styles/theme";
import dayjs from "dayjs";
import { MONTH_DAY_YEAR } from "../../../../constants/application-constant";

const WorkDetails = () => {
  const { work, workPhases } = useContext(WorkplanContext);

  const currentWorkPhaseIndex = workPhases?.findIndex(
    (phase) => phase.work_phase.id === work?.current_work_phase_id
  );
  const previousWorkPhase =
    currentWorkPhaseIndex > 0 ? workPhases?.[currentWorkPhaseIndex - 1] : null;
  const currentWorkPhase = workPhases?.[currentWorkPhaseIndex];
  const nextWorkPhase =
    currentWorkPhaseIndex + 1 < workPhases.length
      ? workPhases?.[currentWorkPhaseIndex + 1]
      : null;

  if (!work) return null;

  return (
    <GrayBox>
      <Grid container spacing={1}>
        <Grid item xs={12} container>
          <Grid item xs={12}>
            <ETCaption1 color={Palette.neutral.main}>
              WORK START DATE
            </ETCaption1>
          </Grid>
          <Grid item xs={12}>
            <ETParagraph color={Palette.neutral.dark}>
              {dayjs(work.start_date).format(MONTH_DAY_YEAR)}
            </ETParagraph>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Divider sx={{ paddingTop: "8px" }} />
        </Grid>
        <Grid item xs={12}>
          <ETCaption1 bold color={Palette.primary.main}>
            ANTICIPATED REFERRAL DATE
          </ETCaption1>
        </Grid>
        <Grid item xs={12}>
          <ETParagraph color={Palette.neutral.dark}>
            {work.anticipated_decision_date ?? "-"}
          </ETParagraph>
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
          <ETParagraph color={Palette.neutral.dark}>
            {currentWorkPhase?.current_milestone ??
              previousWorkPhase?.current_milestone ??
              "-"}
          </ETParagraph>
        </Grid>

        <Grid item xs={6}>
          <ETParagraph color={Palette.neutral.dark}>
            {currentWorkPhase?.next_milestone ??
              nextWorkPhase?.next_milestone ??
              "-"}
          </ETParagraph>
        </Grid>

        <Grid item xs={12}>
          <ETCaption1 bold color={Palette.primary.main}>
            WORK DESCRIPTION
          </ETCaption1>
        </Grid>

        <Grid item xs={12}>
          <ETParagraph color={Palette.neutral.dark}>
            {work.report_description}
          </ETParagraph>
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
          <ETParagraph color={Palette.neutral.dark}>
            {work.ea_act?.name}
          </ETParagraph>
        </Grid>
        <Grid item xs={4}>
          <ETParagraph color={Palette.neutral.dark}>
            {work.federal_involvement?.name}
          </ETParagraph>
        </Grid>
        <Grid item xs={4}>
          <ETParagraph color={Palette.neutral.dark}>
            {work.substitution_act?.name}
          </ETParagraph>
        </Grid>
        <Grid item xs={12}>
          <ETCaption1 bold color={Palette.primary.main}>
            RESPONSIBLE MINISTRY
          </ETCaption1>
        </Grid>
        <Grid item xs={12}>
          <ETParagraph color={Palette.neutral.dark}>
            {work.ministry?.name}
          </ETParagraph>
        </Grid>
        <Grid item xs={12}>
          <ETCaption1 bold color={Palette.primary.main}>
            DECISION MAKER
          </ETCaption1>
        </Grid>
        <Grid item xs={12}>
          <ETParagraph color={Palette.neutral.dark}>
            {work.decision_by?.full_name}
          </ETParagraph>
        </Grid>
      </Grid>
    </GrayBox>
  );
};

export default WorkDetails;
