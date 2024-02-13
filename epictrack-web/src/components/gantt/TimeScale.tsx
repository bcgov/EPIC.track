import React, { useMemo } from "react";
import { ETCaption2 } from "components/shared";
import { dayWidth } from "./constants";
import moment from "moment";

type TimeScaleProps = {
  start: Date;
  end: Date;
  children?: React.ReactNode;
};
export const TimeScale = ({ start, end, children = null }: TimeScaleProps) => {
  const dates: Date[] = [];

  for (
    let date = new Date(start);
    date.getTime() <= end.getTime();
    date.setDate(date.getDate() + 1)
  ) {
    dates.push(new Date(date));
  }

  const monthsInfo = useMemo(() => {
    const months = [];
    const startDate = moment(start);
    const endDate = moment(end);
    for (
      let currentDate = startDate;
      currentDate.isBefore(endDate);
      currentDate = currentDate.add(1, "month")
    ) {
      const month = {
        year: currentDate.year(),
        month: currentDate.format("MMM"),
        days: currentDate.daysInMonth(),
        start: currentDate.clone().startOf("month"),
        end: currentDate.clone().endOf("month"),
      };
      months.push(month);
    }
    return months;
  }, [start, end]);

  const yearsInfo = useMemo(() => {
    // use months info to get years info
    const years = [];
    const startDate = monthsInfo[0].year;
    const endDate = monthsInfo[monthsInfo.length - 1].year;
    for (let year = startDate; year <= endDate; year++) {
      years.push({
        year,
        days: monthsInfo.reduce((acc, month) => {
          if (month.year === year) {
            return acc + month.days;
          }
          return acc;
        }, 0),
      });
    }
    return years;
  }, [monthsInfo]);

  return (
    <div style={{ overflow: "scroll", display: "flex", flexDirection: "row" }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
          }}
        >
          {yearsInfo.map((year, index) => (
            <div
              key={year.year}
              style={{
                textAlign: "center",
                // width: year.days * dayWidth,
                width: `${year.days * dayWidth}px`, // subtract 1px to account for the border of the div
                backgroundColor: "#F9F9FB",
              }}
            >
              <ETCaption2>{year.year}</ETCaption2>
            </div>
          ))}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
          }}
        >
          {monthsInfo.map((month, index) => (
            <div
              key={month.start.format("YYYY-MM")}
              style={{
                // width: month.days * dayWidth,
                width: `${month.days * dayWidth}px`, // subtract 1px to account for the border of the div
                textAlign: "center",
                backgroundColor: "#F9F9FB",
                position: "relative",
              }}
            >
              <ETCaption2>{month.month}</ETCaption2>
            </div>
          ))}
        </div>
        {children}
      </div>
    </div>
  );
};
