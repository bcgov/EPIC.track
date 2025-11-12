import moment from "moment";
import { DATE_FORMAT } from "../constants/application-constant";

type UnitOfTime = "seconds" | "minutes" | "hours" | "days" | "months" | "years";

/**
 *
 * @param date Input date string
 * @param format Valid date format
 * @returns Formatted date string
 */
const formatDate = (date: string, format?: string) => {
  return moment(date).format(format || DATE_FORMAT);
};

const diff = (fromDate: string, toDate: string, unitOfTime: UnitOfTime) => {
  return moment(fromDate).diff(moment(toDate), unitOfTime);
};

const add = (date: string, unit: number, unitOfTime: UnitOfTime) => {
  return moment(date).add(unit, unitOfTime);
};

/**
 * Checks if date1 is after date2 (day precision)
 */
const isAfterDay = (date1: Date | string, date2: Date | string): boolean => {
  return moment(date1).isAfter(moment(date2), "day");
};

/**
 * Checks if date1 is same or after date2 (day precision)
 */
const isSameOrAfterDay = (
  date1: Date | string,
  date2: Date | string,
): boolean => {
  return moment(date1).isSameOrAfter(moment(date2), "day");
};

/**
 * Checks if date1 is same or before date2 (day precision)
 */
const isSameOrBeforeDay = (
  date1: Date | string,
  date2: Date | string,
): boolean => {
  return moment(date1).isSameOrBefore(moment(date2), "day");
};

/**
 * Checks if two dates are the same day
 */
const isSameDay = (date1: Date | string, date2: Date | string): boolean => {
  return moment(date1).isSame(moment(date2), "day");
};

/**
 * Checks if date1 is before date2 (day precision)
 */
const isBeforeDay = (date1: Date | string, date2: Date | string): boolean => {
  return moment(date1).isBefore(moment(date2), "day");
};

/**
 * Checks if two dates are in the same month
 */
const isSameMonth = (date1: Date | string, date2: Date | string): boolean => {
  return moment(date1).isSame(moment(date2), "month");
};

/**
 * Gets the start of a month
 */
const startOfMonth = (date: Date | string): Date => {
  return moment(date).startOf("month").toDate();
};

/**
 * Gets the end of a month
 */
const endOfMonth = (date: Date | string): Date => {
  return moment(date).endOf("month").toDate();
};

/**
 * Formats a month label like "Jan '25" for a given year and month index (0–11).
 */
export function formatMonthLabel(
  selectedYear: number,
  monthIndex: number,
): string {
  const date = new Date(selectedYear, monthIndex, 1);

  // Format month abbreviation, e.g. "Jan"
  const month = new Intl.DateTimeFormat("en", { month: "short" }).format(date);

  // Format two-digit year, e.g. "25"
  const year = String(selectedYear).slice(-2);

  return `${month} '${year}`;
}

const dateUtils = {
  formatDate,
  diff,
  add,
  isAfterDay,
  isSameOrAfterDay,
  isSameOrBeforeDay,
  isSameDay,
  isBeforeDay,
  isSameMonth,
  startOfMonth,
  endOfMonth,
  formatMonthLabel,
};

export default dateUtils;
