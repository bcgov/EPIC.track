import { useContext, useEffect, useState } from "react";
import PhaseAccordion from "./PhaseAccordion";
import { Box, FormControlLabel, Grid } from "@mui/material";
import { WorkplanContext } from "../WorkPlanContext";
import { ETCaption1, ETHeading4 } from "../../shared";
import { CustomSwitch } from "../../shared/CustomSwitch";
import { Palette } from "../../../styles/theme";
import { WorkPhase, WorkPhaseAdditionalInfo } from "../../../models/work";
import { When } from "react-if";

const PhaseContainer = () => {
  const ctx = useContext(WorkplanContext);
  const [showCompletedPhases, setShowCompletedPhases] =
    useState<boolean>(false);
  const [currentAndFuturePhases, setCurrentAndFuturePhases] = useState<
    WorkPhaseAdditionalInfo[]
  >([]);
  const [completedPhases, setCompletedPhases] = useState<
    WorkPhaseAdditionalInfo[]
  >([]);

  useEffect(() => {
    if (ctx.work?.current_work_phase_id && ctx.workPhases.length > 0) {
      const phase = ctx.workPhases.find(
        (workPhase) =>
          workPhase.work_phase.id === ctx.work?.current_work_phase_id
      );
      ctx.setSelectedWorkPhase(phase);
    }
  }, [ctx.workPhases, ctx.work]);

  useEffect(() => {
    const currentAndFuturePhases = ctx.workPhases.filter(
      (p) => !p.work_phase.is_completed
    );
    const completedPhases = ctx.workPhases.filter(
      (p) => p.work_phase.is_completed
    );
    setCompletedPhases(completedPhases);
    setCurrentAndFuturePhases(currentAndFuturePhases);
  }, [showCompletedPhases, ctx.workPhases]);
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
                defaultChecked={false}
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
