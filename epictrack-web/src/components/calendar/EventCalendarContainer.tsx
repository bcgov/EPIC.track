import { useEffect, useMemo, useRef, useState } from "react";
import { Box, Grid, IconButton } from "@mui/material";
import dayjs from "dayjs";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import { Palette } from "styles/theme";
import { ETCaption1 } from "components/shared";
import { EVENT_TYPE } from "components/workPlan/phase/type";
import EventForm from "components/workPlan/event/EventForm";
import TaskForm from "components/workPlan/task/TaskForm";
import TrackSidePanel, {
  DEFAULT_PANEL_SIZE,
} from "components/shared/TrackDialog/TrackSidePanel";
import { CalendarEvent } from "models/event";
import { useEventCalendarContext } from "./EventCalendarContext";
import TaskMilestoneLegend from "./TaskMilestoneLegend";
import { getNDaysArray } from "./utils";
import DaysHeader from "./DaysHeader";
import Month from "./Month";
import {
  DEFAULT_DAYS_IN_ROW,
  DEFAULT_MIN_CELL_SIZE_PX,
  DEFAULT_LABEL_WIDTH,
} from "./constants";

type EventCalendarProps = {
  cellSizePx?: number;
  daysInRow?: number;
};

export const EventCalendarContainer = ({
  daysInRow = DEFAULT_DAYS_IN_ROW,
}: EventCalendarProps) => {
  const {
    events,
    selectedYear,
    setSelectedYear,
    modalOpen,
    milestoneEvent,
    taskEvent,
    selectedEvent,
    onSaveHandler,
    onCancelHandler,
    collapsedMonths,
    toggleMonth,
  } = useEventCalendarContext();

  const [cellSizePx, setCellSizePx] = useState(DEFAULT_MIN_CELL_SIZE_PX);
  const containerRef = useRef<HTMLDivElement>(null);

  const months = useMemo(() => {
    const start = dayjs(`${selectedYear}-01-01`);
    const result = [];
    let current = start;
    for (let i = 0; i < 12; i++) {
      result.push({
        year: current.year(),
        month: current.month(),
        label: current.format("MMM 'YY"),
        start: current,
      });
      current = current.add(1, "month");
    }
    return result;
  }, [selectedYear]);

  const handlePrevYear = () => setSelectedYear((y: number) => y - 1);
  const handleNextYear = () => setSelectedYear((y: number) => y + 1);

  useEffect(() => {
    const resize = () => {
      if (!containerRef.current) return;

      const labelWidth = DEFAULT_LABEL_WIDTH;
      const containerWidth = containerRef.current.offsetWidth;
      const cellGap = 4;
      const totalGap = daysInRow * cellGap;

      const availableWidth = containerWidth - labelWidth - totalGap;
      const calculatedCellSize = Math.floor(availableWidth / daysInRow);
      const cellSizePx = Math.max(calculatedCellSize, DEFAULT_MIN_CELL_SIZE_PX);
      setCellSizePx(cellSizePx);
    };

    resize();
    const observer = new ResizeObserver(resize);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [daysInRow, modalOpen]);

  return (
    <Box
      sx={{
        height: "100%",
        width: "100%",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "row",
          overflow: "hidden",
        }}
      >
        <Box
          ref={containerRef}
          sx={{
            flexGrow: 1,
            flexShrink: 1,
            minWidth: 0,
            overflow: "auto",
          }}
        >
          <Grid container spacing={1} direction="column" p={1}>
            <Grid
              container
              item
              justifyContent={"space-between"}
              alignItems="center"
              mb={2}
            >
              <Box
                display="flex"
                alignItems="center"
                justifyContent="start"
                mb={1}
              >
                <IconButton onClick={handlePrevYear} size="small">
                  <ChevronLeftIcon
                    sx={{
                      color: Palette.neutral.dark,
                    }}
                  />
                </IconButton>
                <ETCaption1
                  mx={1}
                  fontSize={"1rem"}
                  sx={{
                    color: Palette.neutral.dark,
                  }}
                >
                  {selectedYear}
                </ETCaption1>
                <IconButton onClick={handleNextYear} size="small">
                  <ChevronRightIcon
                    sx={{
                      color: Palette.neutral.dark,
                    }}
                  />
                </IconButton>
              </Box>
              <Grid item>
                <TaskMilestoneLegend />
              </Grid>
            </Grid>

            <Box gap={0.5} display="flex" flexDirection="column" width="100%">
              <DaysHeader
                cellSizePx={cellSizePx}
                daysInRow={daysInRow}
                offset={DEFAULT_LABEL_WIDTH}
              />

              {months.map(({ label, start }) => {
                const days = getNDaysArray(start, daysInRow);
                return (
                  <Month
                    key={label}
                    monthLabel={label}
                    labelWidth={DEFAULT_LABEL_WIDTH}
                    days={days}
                    isCollapsed={collapsedMonths[label] || false}
                    toggleCollapsed={() => toggleMonth(label)}
                    cellSizePx={cellSizePx}
                    daysInRow={daysInRow}
                    milestoneEvents={events.filter(
                      (calendarItem: CalendarEvent) => {
                        const eventStart = dayjs(calendarItem.event.start_date);
                        const eventEnd = dayjs(calendarItem.event.end_date);
                        const monthStart = dayjs(start).startOf("month");
                        const monthEnd = dayjs(start).endOf("month");
                        return (
                          (eventStart.isBefore(monthEnd) &&
                            eventEnd.isAfter(monthStart)) ||
                          eventStart.isSame(monthStart, "month") ||
                          eventEnd.isSame(monthStart, "month")
                        );
                      }
                    )}
                  />
                );
              })}
            </Box>
          </Grid>
        </Box>
        {modalOpen && selectedEvent && (
          <Box
            sx={{
              width: `${DEFAULT_PANEL_SIZE}px`,
              flexShrink: 0,
              transition: "all 0.3s ease",
              height: "calc(100vh - 250px)",
            }}
          >
            {selectedEvent?.event?.type === EVENT_TYPE.TASK && (
              <TrackSidePanel
                open={modalOpen}
                dialogTitle={taskEvent ? taskEvent?.name : "Task Details"}
                disableEscapeKeyDown
                disablePortal
                fullWidth
                maxWidth="md"
                okButtonText="Save"
                cancelButtonText="Cancel"
                isActionsRequired
                onCancel={onCancelHandler}
                formId="task-form"
                variant="compact"
              >
                <TaskForm onSave={onSaveHandler} taskEvent={taskEvent} />
              </TrackSidePanel>
            )}
            {selectedEvent?.event?.type === EVENT_TYPE.MILESTONE && (
              <TrackSidePanel
                open={modalOpen}
                dialogTitle={
                  milestoneEvent ? milestoneEvent?.name : "Event Details"
                }
                disableEscapeKeyDown
                disablePortal
                fullWidth
                maxWidth="md"
                okButtonText="Save"
                cancelButtonText="Cancel"
                isActionsRequired
                onCancel={onCancelHandler}
                formId="event-form"
                variant="compact"
                headingCaption={selectedEvent?.phase_name}
              >
                <EventForm
                  onSave={onSaveHandler}
                  event={milestoneEvent}
                  isFormFieldsLocked={!!milestoneEvent?.actual_date}
                />
              </TrackSidePanel>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default EventCalendarContainer;
