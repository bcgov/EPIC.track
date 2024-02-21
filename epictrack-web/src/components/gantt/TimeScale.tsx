import React, { useMemo } from "react";
import { ETCaption3 } from "components/shared";
import { dayWidth, rowHeight } from "./constants";
import moment from "moment";
import { Palette } from "styles/theme";

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
    <div
      id="time-scale"
      style={{
        display: "flex",
        flexDirection: "row",
        backgroundColor: Palette.neutral.bg.light,
      }}
    >
      <div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            height: rowHeight,
            position: "sticky",
            top: 0,
            zIndex: 2,
          }}
        >
          {yearsInfo.map((year) => (
            <div
              key={year.year}
              style={{
                flexShrink: 0,
                textAlign: "center",
                width: `${year.days * dayWidth}px`, // subtract 1px to account for the border of the div
                backgroundColor: Palette.neutral.bg.light,
              }}
            >
              <ETCaption3 bold>{year.year}</ETCaption3>
            </div>
          ))}
        </div>
        <div
          id="months"
          style={{
            display: "flex",
            flexDirection: "row",
            height: rowHeight,
            position: "sticky",
            top: rowHeight,
            backgroundColor: Palette.neutral.bg.light,
            zIndex: 2,
          }}
        >
          {monthsInfo.map((month) => (
            <div
              key={month.start.format("YYYY-MM")}
              style={{
                flexShrink: 0,
                // width: month.days * dayWidth,
                width: `${month.days * dayWidth}px`, // subtract 1px to account for the border of the div
                textAlign: "center",
                backgroundColor: Palette.neutral.bg.light,
                position: "relative",
              }}
            >
              <ETCaption3>{month.month}</ETCaption3>
            </div>
          ))}
        </div>

        <div id="bars">{children}</div>
      </div>
    </div>
  );
};
