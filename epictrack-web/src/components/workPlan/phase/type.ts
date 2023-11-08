import { WorkPhaseAdditionalInfo } from "../../../models/work";

export interface PhaseAccordionProps {
  phase: WorkPhaseAdditionalInfo;
}

export enum EVENT_TYPE {
  MILESTONE = "Milestone",
  TASK = "Task",
}
