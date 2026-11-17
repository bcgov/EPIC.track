import { WorkTypeEnum } from "../workTypes/ids";

/** Overage needs a responsibility in legislated phases and in amendment works. */
export const isOverageResponsibilityRequired = (
  phaseLegislated: boolean,
  workTypeId?: number,
) =>
  phaseLegislated ||
  workTypeId === WorkTypeEnum.AMENDMENT ||
  workTypeId === WorkTypeEnum.JOINT_COMPLEX_AMENDMENT;
