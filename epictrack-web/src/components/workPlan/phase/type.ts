import { WorkPhase } from "../../../models/work";

export interface PhaseAccordionProps {
  phase: WorkPhase;
}

export enum EVENT_TYPE {
  MILESTONE = "Milestone",
  TASK = "Task",
}
