import { WorkPhaseSkeleton } from "../../../models/work";

export interface PhaseAccordionProps {
  workId: number;
  phase: WorkPhaseSkeleton;
}

export interface PhaseContainerProps {
  workId: number;
}

export enum EVENT_TYPE {
  MILESTONE = "Milestone",
  TASK = "Task",
}
