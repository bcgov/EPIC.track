import React, { useContext } from "react";
import PhaseAccordion from "./PhaseAccordion";
import { WorkPhaseSkeleton } from "../../../models/work";
import workService from "../../../services/workService/workService";
import { Box, Skeleton } from "@mui/material";
import { WorkplanContext } from "../WorkPlanContext";

const PhaseContainer = () => {
  const [loading, setLoading] = React.useState<boolean>(false);
  const [phases, setPhases] = React.useState<WorkPhaseSkeleton[]>([]);
  const ctx = useContext(WorkplanContext);

  React.useEffect(() => {
    getWorkById();
  }, [ctx.work?.id]);

  React.useEffect(() => {
    if (ctx.work?.current_phase_id && phases.length > 0) {
      const phase = phases.filter(
        (p) => p.phase_id === ctx.work?.current_phase_id
      )[0];
      ctx.setSelectedPhase(phase);
    }
  }, [phases, ctx.work]);

  const getWorkById = React.useCallback(async () => {
    if (ctx.work?.id) {
      setLoading(true);
      const work = await workService.getWorkPhases(String(ctx.work?.id));
      setPhases(work.data as WorkPhaseSkeleton[]);
      setLoading(false);
    }
  }, [ctx.work?.id]);
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
