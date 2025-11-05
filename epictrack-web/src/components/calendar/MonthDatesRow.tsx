import { Box } from "@mui/material";
import { Palette } from "styles/theme";
import { FC } from "react";
import { isWeekendByIndex } from "./utils/utils";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { CalendarEvent } from "models/event";
import { IconProps } from "components/icons/type";
import Icons from "components/icons";

dayjs.extend(isSameOrBefore);

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
  function getEventCountsByDate(events: CalendarEvent[]) {
    return events.reduce<Record<string, number>>((acc, event) => {
      const start = dayjs(event.event.start_date);
      const end = dayjs(event.event.end_date);
      let current = start.clone();
      // Count every date this event covers
      while (current.isSameOrBefore(end, "day")) {
        const key = current.format("YYYY-MM-DD");
        acc[key] = (acc[key] || 0) + 1;
        current = current.add(1, "day");
      }
      return acc;
    }, {});
  }

  const eventCounts = getEventCountsByDate(events);

  const dotSize = Math.max(3, Math.min(Math.floor(cellSizePx / 8), 5));

  const formatDateKey = (date: Date) => date.toISOString().split("T")[0];

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
                ? "#F6F6F6"
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
