import { WorkPhaseAdditionalInfo } from "../../../models/work";

export interface PhaseAccordionProps {
  phase: WorkPhaseAdditionalInfo;
  expanded: boolean;
  onExpandHandler: (expand: boolean) => void;
  showAnticipated: boolean;
  showActual: boolean;
  isCurrentPhase?: boolean;
}

export { EVENT_TYPE } from "../../../models/event";
