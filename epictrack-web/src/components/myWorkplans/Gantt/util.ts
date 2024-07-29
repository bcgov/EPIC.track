import { WorkPlan } from "models/workplan";
import moment from "moment";

export const getDaysLeft = (phaseInfo: WorkPlan["phase_info"][0]) => {
  const today = moment().startOf("day");
  const isFutureTask = moment(phaseInfo.work_phase.start_date).isAfter(today);
  if (isFutureTask) return "";

  const isCurrentTask = moment(phaseInfo.work_phase.end_date).isAfter(today);

  if (phaseInfo.days_left >= 0) {
    if (isCurrentTask) {
      return `${phaseInfo.days_left}/${phaseInfo.total_number_of_days}`;
    }
    return `0/${phaseInfo.total_number_of_days}`;
  }

  const daysOver = Math.abs(phaseInfo.days_left);

  if (isCurrentTask) {
    return `0/${phaseInfo.total_number_of_days} (${daysOver} over)`;
  }

  return `${daysOver + phaseInfo.total_number_of_days}/${
    phaseInfo.total_number_of_days
  }`;
};

export const getTaskSpan = (start: Date, end: Date) => {
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  const diffInMilliseconds = end.getTime() - start.getTime();
  const millisecondsPerDay = 24 * 60 * 60 * 1000;

  return Math.round(diffInMilliseconds / millisecondsPerDay);
};
