import moment from "moment";
import dateUtils from "../../../utils/dateUtils";
import { Status } from "../../../models/status";
import {
  StalenessEnum,
  STATUS_STALENESS_THRESHOLD,
} from "../../../constants/application-constant";

export const calculateStatusStaleness = (
  lastApprovedStatus: Status | undefined,
  criticalThreshold?: number,
  warningThreshold?: number,
): StalenessEnum => {
  if (!lastApprovedStatus) {
    return StalenessEnum.GOOD;
  }

  const daysAgo = moment();
  const NDaysAgo = dateUtils.diff(
    daysAgo.toISOString(),
    lastApprovedStatus?.posted_date,
    "days",
  );

  if (
    NDaysAgo > (criticalThreshold || STATUS_STALENESS_THRESHOLD["CRITICAL"])
  ) {
    return StalenessEnum.CRITICAL;
  } else if (
    NDaysAgo > (warningThreshold || STATUS_STALENESS_THRESHOLD["WARN"])
  ) {
    return StalenessEnum.WARN;
  } else {
    return StalenessEnum.GOOD;
  }
};
