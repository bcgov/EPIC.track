import { PhaseInfo } from "models/workplan";

export const daysLeft = (phaseInfo: PhaseInfo) => {
  if (phaseInfo && phaseInfo.work_phase.is_completed) {
    return `${phaseInfo.days_left} day${phaseInfo.days_left > 1 ? "s" : ""}`;
  } else if (phaseInfo.days_left >= 0) {
    return `${phaseInfo.days_left}/${phaseInfo.total_number_of_days} days left`;
  }

  const daysOver = Math.abs(phaseInfo.days_left);

  return `${daysOver} day${daysOver > 1 ? "s" : ""} over`;
};
