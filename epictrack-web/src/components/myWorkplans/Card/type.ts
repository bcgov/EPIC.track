import { PhaseInfo, WorkPlan } from "../../../models/workplan";

export interface CardProps {
  workplan: WorkPlan;
}
export enum MilestoneInfoSectionEnum {
  DECISION,
  MILESTONE,
}
export interface MilestoneInfoSectionProps {
  phaseInfo?: PhaseInfo;
  infoType: MilestoneInfoSectionEnum;
}
