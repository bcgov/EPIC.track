import React, { useMemo } from "react";
import { ETCaption3 } from "components/shared";
import { dayWidth, rowHeight } from "./constants";
import moment from "moment";
import { Palette } from "styles/theme";
import { useGanttContext } from "./GanttContext";

type TimeScaleProps = {
  children: React.ReactNode;
};
export const TimeScale = ({ children }: TimeScaleProps) => {
  const { start, end, sectionHeight } = useGanttContext();

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
        zIndex: 3,
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
            zIndex: 3,
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
            // add box shadow only to the bottom of the months
            boxShadow: "rgba(0, 0, 0, 0.2) 0px 3px 3px -3px",
          }}
        >
          {monthsInfo.map((month) => {
            // check if current
            const today = moment();
            const startToCurrentSpan = today.diff(month.start, "days");
            const isCurrentMonth = month.start.isSame(today, "month");
            return (
              <div
                key={month.start.format("YYYY-MM")}
                style={{
                  flexShrink: 0,
                  // width: month.days * dayWidth,
                  width: `${month.days * dayWidth}px`, // subtract 1px to account for the border of the div
                  textAlign: "center",
                  backgroundColor: isCurrentMonth
                    ? Palette.primary.accent.light
                    : Palette.neutral.bg.light,
                  color: isCurrentMonth ? "white" : "inherit",
                  borderRadius: "4px",
                  position: "relative",
                }}
              >
                <ETCaption3>{month.month}</ETCaption3>
                {isCurrentMonth && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: startToCurrentSpan * dayWidth,
                      height: sectionHeight,
                      borderLeft: `${dayWidth}px solid ${Palette.primary.accent.light}`,
                      width: `${dayWidth}px`,
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        <div id="bars">{children}</div>
      </div>
    </div>
  );
};
