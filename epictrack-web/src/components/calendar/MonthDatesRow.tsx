import { Box } from "@mui/material";
import { Palette } from "styles/theme";
import { FC } from "react";
import { isWeekendByIndex } from "./utils/utils";
import { CalendarEvent } from "models/event";
import { IconProps } from "components/icons/type";
import Icons from "components/icons";
import dateUtils from "utils/dateUtils";

const AddIcon: React.FC<IconProps> = Icons["AddIcon"];

type MonthDatesRowProps = {
  days: (Date | null)[];
  cellSizePx: number;
  events: CalendarEvent[];
};

const MonthDatesRow: FC<MonthDatesRowProps> = ({
  days,
  cellSizePx,
  events,
}) => {
  const formatDateKey = (date: Date) => date.toISOString().split("T")[0];

  function getEventCountsByDate(events: CalendarEvent[]) {
    return events.reduce<Record<string, number>>((acc, event) => {
      const end = new Date(event.event.end_date);
      let current = new Date(event.event.start_date);
      // Count every date this event covers
      while (dateUtils.isSameOrBeforeDay(current, end)) {
        const key = formatDateKey(current);
        acc[key] = (acc[key] || 0) + 1;
        current = new Date(current.getTime() + 24 * 60 * 60 * 1000);
      }
      return acc;
    }, {});
  }

  const eventCounts = getEventCountsByDate(events);

  const dotSize = Math.max(3, Math.min(Math.floor(cellSizePx / 8), 5));

  return (
    <>
      {days.map((day, i) => {
        const count = day ? eventCounts[formatDateKey(day)] || 0 : 0;

        return (
          <Box
            key={i}
            fontSize={12}
            textAlign="center"
            sx={{
              position: "relative",
              borderRadius: "2px",
              backgroundColor: isWeekendByIndex(i)
                ? Palette.neutral.bg.main
                : Palette.neutral.bg.light,
              height: cellSizePx,
              lineHeight: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: isWeekendByIndex(i) ? Palette.neutral.light : "inherit",
            }}
          >
            <span>{day?.getDate() || ""}</span>
            <Box display="flex" gap="2px" mt="2px">
              {count > 0 && (
                <Box
                  sx={{
                    position: "absolute",
                    left: "50%",
                    transform: "translateX(-50%)",
                    display: "flex",
                    gap: "2px",
                    alignItems: "center",
                  }}
                >
                  {Array.from({ length: Math.min(count, 3) }).map((_, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        width: dotSize,
                        height: dotSize,
                        borderRadius: "50%",
                        backgroundColor: Palette.primary.accent.light,
                      }}
                    />
                  ))}
                  {count > 3 && (
                    <AddIcon
                      style={{ height: dotSize * 1.5, width: dotSize * 1.5 }}
                      sx={{ color: Palette.neutral.dark }}
                    />
                  )}
                </Box>
              )}
            </Box>
          </Box>
        );
      })}
    </>
  );
};

export default MonthDatesRow;
