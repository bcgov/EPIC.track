import moment from "moment";
import { dayWidth, defaultScrollBackMonths } from "./constants";

export const getDefaultScrollDays = (start: Date, numMonths: number) => {
  const nMonthsAgo = moment()
    .subtract(numMonths, "months")
    .startOf("month")
    .toDate();

  return moment(nMonthsAgo).isAfter(start)
    ? Math.abs(moment(start).diff(nMonthsAgo, "days"))
    : 0;
};

export const scrollToToday = (
  start: Date,
  chartReff?: React.RefObject<HTMLDivElement> | null
) => {
  if (chartReff?.current) {
    chartReff.current.scrollLeft =
      getDefaultScrollDays(start, defaultScrollBackMonths) * dayWidth;
  }
};
