import { Box, Tooltip } from "@mui/material";
import { Palette } from "styles/theme";
import dayjs from "dayjs";
import { ETCaption1 } from "components/shared";
import { FC } from "react";
import { CalendarEvent } from "models/event";
import { EVENT_TYPE } from "components/workPlan/phase/type";
import { isWeekendByIndex } from "./utils";
import { useEventCalendarContext } from "./EventCalendarContext";

type EventWithRow = CalendarEvent & { row: number };

function assignEventRows(events: CalendarEvent[]): EventWithRow[][] {
  const sorted = [...events].sort((a, b) =>
    dayjs(a.event.start_date).diff(dayjs(b.event.start_date))
  );
  const rows: EventWithRow[][] = [];

  sorted.forEach((event) => {
    const placed = rows.some((row) => {
      const lastInRow = row[row.length - 1];
      if (
        dayjs(event.event.start_date).isAfter(
          dayjs(lastInRow.event.end_date),
          "day"
        )
      ) {
        row.push({ ...event, row: rows.indexOf(row) });
        return true;
      }
      return false;
    });

    if (!placed) {
      rows.push([{ ...event, row: rows.length }]);
    }
  });

  return rows;
}

type EventRowProps = {
  events: CalendarEvent[];
  days: (Date | null)[];
  cellSizePx: number;
};

const EventRow: FC<EventRowProps> = ({ events, days, cellSizePx }) => {
  const eventRows = assignEventRows(events);

  const { handleEventClick } = useEventCalendarContext();

  if (eventRows.length === 0) {
    return <></>;
  }

  return (
    <Box display="flex" flexDirection="column" gap={0.5}>
      {eventRows.map((rowEvents, rowIdx) => (
        <Box
          key={rowIdx}
          display="grid"
          gridTemplateColumns={`repeat(${days.length}, ${cellSizePx}px)`}
          gap={0.5}
          alignItems="center"
          sx={{
            padding: "0",
          }}
        >
          {days.map((day, dayIdx) => {
            if (!day) {
              // Empty cell for null days
              return (
                <Box
                  key={`empty-${rowIdx}-${dayIdx}`}
                  sx={{
                    height: cellSizePx,
                    backgroundColor: isWeekendByIndex(dayIdx)
                      ? "#F6F6F6"
                      : Palette.neutral.bg.light,
                    color: "transparent",
                    border: "none",
                    borderRadius: "2px",
                  }}
                />
              );
            }
            const eventItem = rowEvents.find(
              (ev) => day && dayjs(ev.event.start_date).isSame(day, "day")
            );

            // If an event starts on this day, render it with span
            if (eventItem) {
              const event = eventItem.event;
              const startIdx = dayIdx;
              const endIdx = days.findIndex(
                (d) => d && dayjs(d).isSame(dayjs(event.end_date), "day")
              );
              const span = endIdx - startIdx + 1;

              const title =
                event.type === EVENT_TYPE.MILESTONE
                  ? `${eventItem.phase_name}: ${event.name}`
                  : event.name;

              return (
                <Box
                  key={event.id}
                  gridColumn={`span ${span}`}
                  onClick={() => handleEventClick?.(eventItem)}
                  sx={{
                    height: cellSizePx,
                    backgroundColor:
                      eventItem.event.type === EVENT_TYPE.MILESTONE
                        ? "#BACDDF"
                        : "#C6DFDB",
                    color: Palette.primary.main,
                    borderRadius: "4px",
                    borderColor:
                      eventItem.event.type === EVENT_TYPE.MILESTONE
                        ? "#BACDDF"
                        : "#C6DFDB",
                    paddingLeft: "4px",
                    display: "flex",
                    alignItems: "center",
                    overflow: "hidden",
                    width: "100%",
                    cursor: "pointer",
                  }}
                >
                  <Tooltip title={title} sx={{ width: "100%" }}>
                    <Box sx={{ width: "100%", overflow: "hidden" }}>
                      <ETCaption1
                        sx={{
                          display: "block",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {title}
                      </ETCaption1>
                    </Box>
                  </Tooltip>
                </Box>
              );
            }

            // If this cell falls inside a span already rendered, skip rendering it
            const inSpan = rowEvents.some((ev) => {
              const evStartIdx = days.findIndex(
                (d) => d && dayjs(d).isSame(dayjs(ev.event.start_date), "day")
              );
              const evEndIdx = days.findIndex(
                (d) => d && dayjs(d).isSame(dayjs(ev.event.end_date), "day")
              );
              return dayIdx > evStartIdx && dayIdx <= evEndIdx;
            });

            if (inSpan) return null;

            return (
              <Box
                key={`empty-${rowIdx}-${dayIdx}`}
                sx={{
                  height: cellSizePx,
                  backgroundColor: isWeekendByIndex(dayIdx)
                    ? "#F6F6F6"
                    : "inherit",
                  color: isWeekendByIndex(dayIdx)
                    ? Palette.neutral.light
                    : "inherit",
                  border: day ? `1px solid ${Palette.neutral.bg.dark}` : "none",
                  borderRadius: "2px",
                }}
              />
            );
          })}
        </Box>
      ))}
    </Box>
  );
};

export default EventRow;
