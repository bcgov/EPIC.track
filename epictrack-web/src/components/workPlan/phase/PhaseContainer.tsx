import { useContext, useEffect } from "react";
import PhaseAccordion from "./PhaseAccordion";
import { Box, Grid } from "@mui/material";
import { WorkplanContext } from "../WorkPlanContext";
import { ETHeading4 } from "../../shared";

const PhaseContainer = () => {
  const ctx = useContext(WorkplanContext);

  useEffect(() => {
    if (
      ctx.work?.current_phase_id &&
      ctx.workPhases.length > 0 &&
      !ctx.selectedWorkPhase
    ) {
      const phase = ctx.workPhases.find(
        (workPhase) => workPhase.phase.id === ctx.work?.current_phase_id
      );
      ctx.setSelectedWorkPhase(phase);
    }
  }, [ctx.workPhases, ctx.work]);

  if (ctx.workPhases.length === 0) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <ETHeading4>This work has no phases to be displayed</ETHeading4>
      </Box>
    );
  }

  return (
    <Grid container spacing={1}>
      {ctx.workPhases.map((phase) => (
        <Grid item xs={12}>
          <PhaseAccordion
            key={`phase-accordion-${phase.phase.id}`}
            phase={phase}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default PhaseContainer;
