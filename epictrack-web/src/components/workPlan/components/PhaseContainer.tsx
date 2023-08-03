import React from "react";
import PhaseAccordion from "./PhaseAccordion";
import { WorkPhaseSkeleton } from "../../../models/work";
import workService from "../../../services/workService/workService";
import { PhaseAccordionProps, PhaseContainerProps } from "../type";
import { Box, Skeleton } from "@mui/material";

const PhaseContainer = ({
  workId,
  currentPhase,
  ...props
}: PhaseContainerProps) => {
  const [loading, setLoading] = React.useState<boolean>(false);
  const [phases, setPhases] = React.useState<WorkPhaseSkeleton[]>([]);

  React.useEffect(() => {
    getWorkById();
  }, [workId]);

  const getWorkById = React.useCallback(async () => {
    if (workId) {
      setLoading(true);
      const work = await workService.getWorkPhases(String(workId));
      setPhases(work.data as WorkPhaseSkeleton[]);
      console.log(work.data);
      setLoading(false);
    }
  }, [workId]);
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
            currentPhase={currentPhase}
          ></PhaseAccordion>
        ))
      )}
    </>
  );
};

export default PhaseContainer;
