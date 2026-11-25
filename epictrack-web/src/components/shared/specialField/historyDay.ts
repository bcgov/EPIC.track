import dayjs from "dayjs";
import { SpecialField } from "./type";

const DAY_FORMAT = "YYYY-MM-DD";

/**
 * The calendar day of a history date, as YYYY-MM-DD.
 *
 * A day from the API is used as it is. Anything else is a value picked in the date
 * picker, or an instant from an API that does not report days yet, and is read in the
 * browser's timezone.
 */
export const toHistoryDay = (value: unknown): string => {
  if (typeof value === "string" && value.length === DAY_FORMAT.length) {
    return value;
  }
  return dayjs(value as dayjs.ConfigType).format(DAY_FORMAT);
};

/**
 * Replace an entry's dates with the days the API reports for them.
 *
 * The API decides which day an entry starts and ends on. Working a day out from the
 * instant in the browser depends on the browser's timezone and timezone data, and can
 * land on the day before.
 */
export const withHistoryDays = (entry: SpecialField): SpecialField => ({
  ...entry,
  active_from: entry.active_from_day ?? entry.active_from,
  active_to: entry.active_to_day ?? entry.active_to,
});
