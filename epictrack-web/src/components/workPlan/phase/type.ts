import { WorkPhaseAdditionalInfo } from "../../../models/work";

export interface PhaseAccordionProps {
  phase: WorkPhaseAdditionalInfo;
  expanded: boolean;
  onExpandHandler: (expand: boolean) => void;
}

export enum EVENT_TYPE {
  MILESTONE = "Milestone",
  TASK = "Task",
}
