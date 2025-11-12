import { FC } from "react";
import { Box, Tooltip } from "@mui/material";
import { Palette } from "styles/theme";
import dateUtils from "utils/dateUtils";
import { CalendarEvent } from "models/event";
import { ETCaption1 } from "components/shared";
import { EVENT_TYPE } from "components/workPlan/phase/type";
import { isWeekendByIndex } from "./utils/utils";
import { getEventIcon } from "./utils/eventIcons";
import { useEventCalendarContext } from "./EventCalendarContext";
import { darkenHex, getWorkColour } from "./Legends/utils";
import { LEGEND_COLOURS } from "./constants";

type EventWithRow = CalendarEvent & { row: number };

function assignEventRows(events: CalendarEvent[]): EventWithRow[][] {
  const sorted = [...events].sort((a, b) =>
    dateUtils.diff(a.event.start_date, b.event.start_date, "days"),
  );
  const rows: EventWithRow[][] = [];

  sorted.forEach((event) => {
    const placed = rows.some((row) => {
      const lastInRow = row[row.length - 1];
      if (
        dateUtils.isAfterDay(event.event.start_date, lastInRow.event.end_date)
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
  cellSizePx: number;
  days: (Date | null)[];
  events: CalendarEvent[];
  showWorkLegend: boolean;
};

const EventRow: FC<EventRowProps> = ({
  cellSizePx,
  days,
  events,
  showWorkLegend,
}) => {
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
            const eventItem = rowEvents.find((ev) => {
              const start = ev.event.start_date;
              const end = ev.event.end_date;
              return (
                day &&
                dateUtils.isSameOrAfterDay(day, start) &&
                dateUtils.isSameOrBeforeDay(day, end)
              );
            });

            // If an event starts on this day, render it with span
            if (eventItem) {
              const event = eventItem.event;

              const firstVisible = days.findIndex((d) => d !== null);
              const lastVisible =
                days.length -
                1 -
                [...days].reverse().findIndex((d) => d !== null);

              const actualStartIdx = days.findIndex(
                (d) => d && dateUtils.isSameDay(d, event.start_date),
              );

              const actualEndIdx = days.findIndex(
                (d) => d && dateUtils.isSameDay(d, event.end_date),
              );

              // If the event starts before this month, start from first day in month
              const startIdx =
                actualStartIdx === -1 ? firstVisible : actualStartIdx;
              // If the event ends after this month, end span at last day in month
              const endIdx = actualEndIdx === -1 ? lastVisible : actualEndIdx;

              if (dayIdx === startIdx) {
                const span = endIdx - startIdx + 1;

                const title =
                  event.type === EVENT_TYPE.MILESTONE
                    ? `${eventItem.phase_name}: ${event.name}`
                    : event.name;

                const colour = showWorkLegend
                  ? getWorkColour(eventItem.work_name)
                  : eventItem.event.type === EVENT_TYPE.MILESTONE
                    ? LEGEND_COLOURS.backgroundColour.MILESTONE
                    : LEGEND_COLOURS.backgroundColour.TASK;

                const borderColour = showWorkLegend
                  ? darkenHex(colour, 0.3)
                  : colour;

                const eventIcon = getEventIcon(eventItem, showWorkLegend);
                const showOnlyIcon = eventIcon && span === 1;

                return (
                  <Box
                    key={event.id}
                    gridColumn={`span ${span}`}
                    onClick={() => handleEventClick?.(eventItem)}
                    sx={{
                      height: cellSizePx,
                      backgroundColor: colour,
                      color: Palette.primary.main,
                      borderRadius: "4px",
                      borderColor: borderColour,
                      display: "flex",
                      alignItems: "center",
                      overflow: "hidden",
                      width: "100%",
                      cursor: "pointer",
                    }}
                  >
                    <Tooltip title={title} sx={{ width: "100%" }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: showOnlyIcon
                            ? "center"
                            : "flex-start",
                          width: "100%",
                          overflow: "hidden",
                          paddingLeft: showOnlyIcon ? 0 : 0.5,
                          gap: showOnlyIcon ? 0 : 0.5,
                        }}
                      >
                        {eventIcon}
                        {!showOnlyIcon && (
                          <ETCaption1
                            sx={{
                              display: "block",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              fontSize: "0.75rem",
                            }}
                          >
                            {title}
                          </ETCaption1>
                        )}
                      </Box>
                    </Tooltip>
                  </Box>
                );
              }
              return null;
            }

            // If this cell falls inside a span already rendered, skip rendering it
            const inSpan = rowEvents.some((ev) => {
              const evStartIdx = days.findIndex(
                (d) => d && dateUtils.isSameDay(d, ev.event.start_date),
              );
              const evEndIdx = days.findIndex(
                (d) => d && dateUtils.isSameDay(d, ev.event.end_date),
              );
              const start = evStartIdx === -1 ? 0 : evStartIdx;
              const end = evEndIdx === -1 ? days.length - 1 : evEndIdx;
              return dayIdx > start && dayIdx <= end;
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
