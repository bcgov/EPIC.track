import moment from "moment";

export const getDefaultScrollDays = (start: Date, numMonths: number) => {
  const nMonthsAgo = moment()
    .subtract(numMonths, "months")
    .startOf("month")
    .toDate();

  return moment(nMonthsAgo).isAfter(start)
    ? Math.abs(moment(start).diff(nMonthsAgo, "days"))
    : 0;
};
