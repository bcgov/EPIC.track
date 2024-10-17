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

export default {
  formatDate,
  diff,
  add,
};
