import { useContext, useEffect } from "react";
import PhaseAccordion from "./PhaseAccordion";
import { Box, Grid } from "@mui/material";
import { WorkplanContext } from "../WorkPlanContext";
import { ETHeading4 } from "../../shared";

const PhaseContainer = () => {
  const { setSelectedWorkPhase, work, workPhases } =
    useContext(WorkplanContext);

  useEffect(() => {
    if (work?.current_phase_id && workPhases.length > 0) {
      const phase = workPhases.find(
        (workPhase) => workPhase.phase.id === work?.current_phase_id
      );
      setSelectedWorkPhase(phase);
    }
  }, [workPhases, work]);

  if (workPhases.length === 0) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <ETHeading4>This work has no phases to be displayed</ETHeading4>
      </Box>
    );
  }

  return (
    <Grid container spacing={1}>
      {workPhases.map((phase) => (
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
