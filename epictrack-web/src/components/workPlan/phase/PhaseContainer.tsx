import React, { useContext } from "react";
import PhaseAccordion from "./PhaseAccordion";
import { Box, Skeleton } from "@mui/material";
import { WorkplanContext } from "../WorkPlanContext";

const PhaseContainer = () => {
  const [loading, setLoading] = React.useState<boolean>(false);
  const ctx = useContext(WorkplanContext);
  const phases = React.useMemo(() => {
    setLoading(!(ctx.workPhases.length > 0));
    return ctx.workPhases;
  }, [ctx.workPhases]);
  React.useEffect(() => {
    if (ctx.work?.current_phase_id && phases.length > 0) {
      const phase = phases.filter(
        (p) => p.phase.id === ctx.work?.current_phase_id
      )[0];
      ctx.setSelectedWorkPhase(phase);
    }
  }, [phases, ctx.work]);

  return (
    <>
      {loading ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <Skeleton variant="rectangular" height={60} />
          <Skeleton variant="rectangular" height={60} />
          <Skeleton variant="rectangular" height={60} />
        </Box>
      ) : (
        phases.map((phase, index) => (
          <PhaseAccordion
            key={`phase-accordion-${index}`}
            phase={phase}
          ></PhaseAccordion>
        ))
      )}
    </>
  );
};

export default PhaseContainer;
