import { PhaseInfo, WorkPlan } from "../../../models/workplan";
import { StalenessSettings } from "../../../models/settings";

export interface CardProps {
  workplan: WorkPlan;
  statusStalenessSettings?: StalenessSettings;
}
export enum MilestoneInfoSectionEnum {
  DECISION,
  MILESTONE,
}
export interface MilestoneInfoSectionProps {
  phaseInfo?: PhaseInfo;
  infoType: MilestoneInfoSectionEnum;
}
