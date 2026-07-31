import { useCallback, useEffect, useMemo, useState } from "react";
import moment from "moment";
import { extendMoment } from "moment-range";
import { Box, SxProps } from "@mui/material";
import Month from "./components/Month";
import { CalendarEvent } from "./type";
import { ETPageContainer, ETParagraph } from "../shared";
import TrackDialog from "../shared/TrackDialog";
import EventDetails from "./components/EventDetails";
import ReportService from "../../services/reportService";
import { Palette } from "../../styles/theme";

const extendedMoment = extendMoment(moment);

const titleStyle: SxProps = {
  gridColumn: "span 7",
  borderBottom: `1px solid ${Palette.neutral.bg.dark}`,
  borderTop: `2px solid ${Palette.neutral.bg.dark}`,

  textAlign: "center",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  "&:first-of-type": { gridColumn: "15/22" },
  "&::before, &:nth-of-type(7)::after": {
    content: '" "',
    width: "2px",
    backgroundColor: Palette.neutral.bg.dark,
    top: "0",
    bottom: "0",
    left: "0",
    display: "block",
    position: "absolute",
    gridRowStart: 1,
    zIndex: 1,
  },
  "&:nth-of-type(2)::before": {
    gridColumnStart: 15,
  },
  "&:nth-of-type(3)::before": {
    gridColumnStart: 22,
  },
  "&:nth-of-type(4)::before": {
    gridColumnStart: 29,
  },
  "&:nth-of-type(5)::before": {
    gridColumnStart: 36,
  },
  "&:nth-of-type(6)::before": {
    gridColumnStart: 43,
  },
  "&:nth-of-type(7)::before": {
    gridColumnStart: 50,
  },
  "&:nth-of-type(7)::after": {
    right: 0,
    left: "auto",
    gridColumnEnd: "-1",
  },
  "&:last-of-type::after": { right: "0" },
};

const EventCalendar = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [hoveredEvent, setHoveredEvent] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent>();
  const [showPopup, setShowPopup] = useState(false);

  const prevMonth = extendedMoment().subtract(1, "months");
  const lastMonth = extendedMoment().endOf("year");
  const monthRange = extendedMoment.range(prevMonth, lastMonth).snapTo("month");
  const months = Array.from(monthRange.by("month"));

  const days = ["S", "M", "T", "W", "T", "F", "S"];

  const togglePopup = () => {
    setShowPopup(!showPopup);
  };

  const handleEventClick = (event_id: number) => {
    setShowPopup(true);
    const event = events.find((e: any) => e.id === event_id);
    setSelectedEvent(event);
  };

  const monthEvents: any = useMemo(() => {
    const monthData: any = {};
    months.forEach((month: any) => {
      const data = events.filter(
        (e: any) =>
          (extendedMoment(e.start_date).year() === month.year() &&
            extendedMoment(e.start_date).month() === month.month()) ||
          (extendedMoment(e.end_date).year() === month.year() &&
            extendedMoment(e.end_date).month() === month.month()),
      );
      monthData[month.format("MMMM")] = data;
    });
    return monthData;
  }, [events, months]);

  const getEvents = useCallback(async () => {
    const eventsResult = await ReportService.getEventCalendar();
    if (eventsResult.status === 200) {
      setEvents(eventsResult.data as CalendarEvent[]);
    }
  }, []);

  useEffect(() => {
    getEvents();
  }, [getEvents]);

  return (
    <>
      <ETPageContainer
        direction="row"
        container
        columnSpacing={2}
        rowSpacing={3}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateRows: "1fr",
            gridTemplateColumns: "1fr auto 1fr",
            gridTemplateAreas: '". calendar ."',
            margin: "0 auto",
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(56, 1.5rem)",
              gridAutoRows: "1.5rem",
              position: "relative",
              gridArea: "calendar",
              gridColumn: "1/-1",
              justifyContent: "center",
              alignItems: "center",
              counterReset: "title",
              "& *": { margin: "0" },
            }}
          >
            <Box
              sx={{
                display: "flex",
                height: "100%",
                alignItems: "center",
                gridColumn: "8 / 15",
                gridRow: "span 2",
                textAlign: "center",
                borderTop: `2px solid ${Palette.neutral.bg.dark}`,
                borderLeft: `2px solid ${Palette.neutral.bg.dark}`,
                justifyContent: "center",
                "&::before": {
                  content: '" "',
                  width: "2px",
                  backgroundColor: Palette.neutral.bg.dark,
                  top: "0",
                  bottom: "0",
                  left: "0",
                  display: "block",
                  position: "absolute",
                  gridRowStart: "1",
                  zIndex: 1,
                  gridColumnStart: 8,
                },
              }}
            >
              <ETParagraph bold className="titleRow">
                Projects
              </ETParagraph>
            </Box>
            <Box
              sx={{
                ...titleStyle,
              }}
            >
              <ETParagraph bold className="titleRow">
                Week 1
              </ETParagraph>
            </Box>
            <Box
              sx={{
                ...titleStyle,
              }}
            >
              <ETParagraph bold className="titleRow">
                Week 2
              </ETParagraph>
            </Box>
            <Box
              sx={{
                ...titleStyle,
              }}
            >
              <ETParagraph bold className="titleRow">
                Week 3
              </ETParagraph>
            </Box>
            <Box
              sx={{
                ...titleStyle,
              }}
            >
              <ETParagraph bold className="titleRow">
                Week 4
              </ETParagraph>
            </Box>
            <Box
              sx={{
                ...titleStyle,
              }}
            >
              <ETParagraph bold className="titleRow">
                Week 5
              </ETParagraph>
            </Box>
            <Box
              sx={{
                ...titleStyle,
              }}
            >
              <ETParagraph bold className="titleRow">
                Week 6
              </ETParagraph>
            </Box>
            {[1, 2, 3, 4, 5, 6].map((n) =>
              days.map((d, i) => (
                <Box
                  sx={{
                    textAlign: "center",
                    "&:nth-of-type(8)": { gridColumnStart: "15" },
                    "&::after": {
                      content: '" "',
                      width: "1px",
                      backgroundColor: Palette.neutral.bg.dark,
                      top: "0",
                      bottom: "0",
                      display: "block",
                      position: "absolute",
                      gridRowStart: "2",
                      zIndex: 1,
                    },
                  }}
                  key={`week${n}_${d}_${i}`}
                >
                  <ETParagraph>{days[i]}</ETParagraph>
                </Box>
              )),
            )}

            {months.map((month, index) => (
              <Month
                month={month}
                numTasks={Math.floor(Math.random() * (5 - 1)) + 2}
                key={`${month.toString()}-${index}`}
                events={monthEvents ? monthEvents[month.format("MMMM")] : []}
                setHoveredEvent={setHoveredEvent}
                hoveredEvent={hoveredEvent}
                handleEventClick={handleEventClick}
              />
            ))}
          </Box>
        </Box>
      </ETPageContainer>
      <TrackDialog
        open={showPopup}
        dialogTitle="Project Details"
        disableEscapeKeyDown
        fullWidth
        maxWidth="sm"
        isOkRequired={false}
        cancelButtonText="Close"
        onCancel={() => togglePopup()}
      >
        <EventDetails event={selectedEvent} />
      </TrackDialog>
    </>
  );
};

export default EventCalendar;
