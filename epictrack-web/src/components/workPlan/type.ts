import { WorkPhaseSkeleton } from "../../models/work";

export interface PhaseAccordionProps {
  phase: WorkPhaseSkeleton;
  currentPhase: number | undefined;
}

export interface PhaseContainerProps {
  workId?: string | null;
  currentPhase: number | undefined;
}