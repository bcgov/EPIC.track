import { useContext, useEffect, useMemo, useState } from "react";
import PhaseAccordion from "./PhaseAccordion";
import { Box, FormControlLabel, Grid } from "@mui/material";
import { WorkplanContext } from "../WorkPlanContext";
import { ETCaption1, ETHeading4 } from "../../shared";
import { CustomSwitch } from "../../shared/CustomSwitch";
import { Palette } from "../../../styles/theme";
import { WorkPhaseAdditionalInfo } from "../../../models/work";
import { When } from "react-if";
import useRouterLocationStateForHelpPage from "hooks/useRouterLocationStateForHelpPage";

const PhaseContainer = () => {
  const ctx = useContext(WorkplanContext);
  const [showCompletedPhases, setShowCompletedPhases] = useState<boolean>(true);

  const currentAndFuturePhases: WorkPhaseAdditionalInfo[] = useMemo(
    () => ctx.workPhases.filter((p) => !p.work_phase.is_completed),
    [ctx.workPhases]
  );
  const completedPhases: WorkPhaseAdditionalInfo[] = useMemo(
    () => ctx.workPhases.filter((p) => p.work_phase.is_completed),
    [ctx.workPhases]
  );

  useEffect(() => {
    if (
      ctx.work?.current_work_phase_id &&
      ctx.workPhases.length > 0 &&
      !ctx.selectedWorkPhase
    ) {
      const phase = ctx.workPhases.find(
        (workPhase) =>
          workPhase.work_phase.id === ctx.work?.current_work_phase_id
      );
      ctx.setSelectedWorkPhase(phase);
    }
  }, [ctx.workPhases, ctx.work]);

  useRouterLocationStateForHelpPage(() => {
    return ctx.work?.work_type?.name ?? undefined;
  }, [ctx.work?.work_type_id]);

  if (ctx.workPhases.length === 0) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <ETHeading4>This work has no phases to be displayed</ETHeading4>
      </Box>
    );
  }

  return (
    <Grid container spacing={1}>
      <When condition={completedPhases.length > 0}>
        <Grid item xs={12}>
          <FormControlLabel
            sx={{
              ml: "2px",
            }}
            control={
              <CustomSwitch
                onChange={(e, checked) => setShowCompletedPhases(checked)}
                sx={{
                  marginRight: "8px",
                  color: Palette.neutral.dark,
                }}
                defaultChecked={showCompletedPhases}
              />
            }
            label="Completed Phases"
          />
        </Grid>
      </When>
      <When condition={showCompletedPhases}>
        {completedPhases.map((phase) => (
          <Grid item xs={12}>
            <PhaseAccordion
              key={`phase-accordion-${phase.work_phase.id}`}
              phase={phase}
            />
          </Grid>
        ))}
      </When>
      <When condition={currentAndFuturePhases.length > 0}>
        <Grid item xs={12}>
          <ETCaption1
            sx={{
              color: Palette.neutral.dark,
            }}
          >
            CURRENT AND FUTURE PHASES
          </ETCaption1>
        </Grid>
      </When>
      {currentAndFuturePhases.map((phase) => (
        <Grid item xs={12}>
          <PhaseAccordion
            key={`phase-accordion-${phase.work_phase.id}`}
            phase={phase}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default PhaseContainer;
