import moment from "moment";
import dateUtils from "../../../utils/dateUtils";
import { Status } from "../../../models/status";

const STATUS_DATE_THRESHOLD = 7;

export const isStatusOutOfDate = (
  lastApprovedStatus: Status | undefined
): boolean => {
  if (!lastApprovedStatus) {
    return false;
  }

  const daysAgo = moment().subtract(STATUS_DATE_THRESHOLD, "days");
  const NDaysAgo = dateUtils.diff(
    daysAgo.toLocaleString(),
    lastApprovedStatus?.posted_date,
    "days"
  );

  return NDaysAgo > 0;
};
