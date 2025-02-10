import React from "react";
import * as Moment from "moment";
import { extendMoment } from "moment-range";
import * as _ from "lodash";
import { Box } from "@mui/material";
import { ETParagraph } from "../../shared";

const extendedMoment = extendMoment(Moment);

const Month = ({
  month,
  events,
  hoveredEvent,
  setHoveredEvent,
  handleEventClick,
  key,
}: any) => {
  const start = month;
  const end = extendedMoment(month).endOf("month");
  const dateRange = extendedMoment.range(start, end);
  const dates = Array.from(dateRange.by("day"));

  const firstDay = start.weekday();
  const startOffset = [...Array(firstDay)];
  const endOffset = [...Array(42 - (firstDay + dates.length))];
  const monthDates = [...startOffset, ...dates, ...endOffset];

  const prepareEventDates = (events: any[]) => {
    return events.map((e: any) => {
      let start_date: any = extendedMoment(e.start_date);
      let end_date: any = extendedMoment(e.end_date);
      if (start_date < start) {
        start_date = start;
      }
      if (end_date > end) {
        end_date = end;
      }
      return { ...e, start_date, end_date };
    });
  };

  const engagements = _.filter(
    events,
    (e: any) => e.project && e.project !== "null"
  );
  const engagementsWithoutProject = prepareEventDates(
    _.filter(events, (e: any) => e.project === "null" || e.project === null)
  );

  const eventsData = _.groupBy(
    prepareEventDates(_.slice(_.orderBy(engagements, "start_date"))),
    "project"
  );

  const numTasks =
    Object.keys(eventsData).length + engagementsWithoutProject.length + 1;

  const handleMouseOver = (event: any) => {
    setHoveredEvent(event.id);
  };

  const handleMouseLeave = () => {
    setHoveredEvent(null);
  };

  const getShortForm = (str: string | null) => {
    if (str && str !== "null" && str !== "undefined") {
      const matches = str.match(/\b(\w)/g);
      const acronym = matches?.join("").toUpperCase() || "";
      return acronym;
    }
    return "";
  };

  const renderMonthDates = () => [
    <ETParagraph
      style={{ gridColumn: "8 / 15", textAlign: "center" }}
    ></ETParagraph>,
    monthDates.map((date: any, i: number) => (
      <Box
        sx={{
          ...(!date && {
            gridRow: `span ${numTasks + 1}`,
            height: "100%",
            backgroundColor: "#d2d8e5",
          }),
          ...(date && {
            [`&:nth-child(${3 + i})`]: {
              "&::after": {
                content: '" "',
                height: "1px",
                backgroundColor: "#a7bce8",
                left: "0",
                right: "0",
                display: "block",
                position: "absolute",
                width: "100%",
                gridColumnStart: "8",
              },
            },
          }),
        }}
      >
        <ETParagraph
          sx={{
            ...(Boolean(date) && {
              textAlign: "center",
            }),
          }}
          key={`day-${i}`}
        >
          {date && date.format("D")}
        </ETParagraph>
      </Box>
    )),
  ];

  const renderProjectNames = () =>
    _.keys(eventsData).map((projectName: string, i: number) => (
      <ETParagraph
        sx={{
          fontWeight: "bold",
          fontSize: "1rem",
          "&::after": {
            content: '" "',
            height: "1px",
            backgroundColor: "#a7bce8",
            left: "0",
            right: "0",
            display: "block",
            position: "absolute",
            width: "100%",
            gridColumnStart: "8",
          },
        }}
        key={`${projectName}-name`}
        title={projectName}
        style={{ gridColumn: "8 / 15", textAlign: "center", gridRow: i + 2 }}
      >
        {eventsData[projectName][0].project_short_code &&
        eventsData[projectName][0].project_short_code !== "null" &&
        eventsData[projectName][0].project_short_code !== "undefined"
          ? eventsData[projectName][0].project_short_code
          : getShortForm(projectName)}
      </ETParagraph>
    ));

  const renderEvents = (projectData: any, projectStart: any) =>
    projectData.map((event: any, i: number) => {
      const style = {
        // height: "100%",
        backgroundColor: event.color || "#E6E6E6",
        gridColumn: `${
          1 + Math.abs(projectStart.start_date.date() - event.start_date.date())
        } / ${2 + event.end_date.date() - projectStart.start_date.date()}`,
        gridRow: 1,
        zIndex: 100 + event.start_date.date(),
      };
      return (
        <Box
          key={`event-${event.id}`}
          sx={{
            overflow: "hidden",
            borderRadius: "5px",
            cursor: "pointer",
            transition: "opacity 250ms ease-in-out",
            border: "1px solid #ccd6eb",
            wordWrap: "normal",
            maxHeight: "100%",
            ...(hoveredEvent === event.id && {
              zIndex: "1000 !important",
              // textIndent: "0",
              boxShadow: "3px 3px #6863632b",
            }),
          }}
          style={style}
          title={`${event.name}${
            event.work_type ? ` | ${event.work_type}` : ""
          }${event.phase ? ` | ${event.phase}` : ""}`}
          onMouseEnter={() => handleMouseOver(event)}
          onMouseLeave={handleMouseLeave}
          onClick={() => handleEventClick(event.id)}
        >
          <ETParagraph>{getShortForm(event.name)}</ETParagraph>
        </Box>
      );
    });

  const renderProjects = () =>
    _.keys(eventsData).map((projectName: string, i: number) => {
      const projectData = eventsData[`${projectName}`];
      if (projectData) {
        const projectStart = _.minBy(projectData, "start_date");
        const projectEnd = _.maxBy(projectData, "end_date");
        const projectEventDuration =
          1 + (projectEnd.end_date.date() - projectStart.start_date.date());
        const style = {
          gridColumn: `${14 + firstDay + projectStart.start_date.date()} / ${
            15 + firstDay + projectEnd.end_date.date()
          }`,
          gridRow: i + 2,
          display: "grid",
          gridTemplateColumns: `repeat(${projectEventDuration} , 1.5rem)`,
          gridTemplateRows: "1.5rem",
          alignItems: "center",
        };

        return (
          <>
            <Box style={style} key={`${projectName}-grid`}>
              {renderEvents(projectData, projectStart)}
            </Box>
          </>
        );
      }
    });

  const renderEngagements = () =>
    engagementsWithoutProject.map((engagement: any, i: number) => {
      const start = engagement.start_date;
      const end = engagement.end_date;
      const duration = 1 + (end.date() - start.date());
      const style = {
        gridColumn: `${14 + firstDay + start.date()} / ${
          15 + firstDay + end.date()
        }`,
        gridRow: `${2 + Object.keys(eventsData).length + i}`,
        display: "grid",
        gridTemplateColumns: `repeat(${duration}, 1.5rem)`,
        gridTemplateRows: "1.5rem",
        alignItems: "center",
      };
      return (
        <ETParagraph style={style} key={`no-project-${i}`}>
          {renderEvents([engagement], engagement)}
        </ETParagraph>
      );
    });

  const style = {
    gridRow: `span ${numTasks + 1}`,
    gridTemplateRows: `repeat(${numTasks}, 1.5rem)`,
  };

  return (
    <Box
      sx={{
        display: "grid",
        border: "2px solid #a7bce8",
        borderWidth: "2px 0 2px 2px",
        gridColumn: "1/-1",
        gridTemplateColumns: "repeat(56, 1.5rem)",
        gridAutoRows: "1.5rem",
        position: "relative",
        overflow: "hidden",
        justifyContent: "center",
        alignItems: "center",
        "&:not(:last-child)": { borderBottom: "none" },
      }}
      style={style}
      key={key}
    >
      <Box
        style={style}
        sx={{
          gridColumn: "span 7",
          textAlign: "center",
          fontWeight: "bold",
          fontSize: "1.5rem",
          "&::after": {
            content: '" "',
            width: "1px",
            height: "100%",
            backgroundColor: "#a7bce8",
            display: "block",
            position: "absolute",
            top: "0",
            bottom: "0",
            left: "0",
            gridColumnStart: "8",
          },
        }}
      >
        <ETParagraph bold className="name">
          {month.format("MMMM")}
        </ETParagraph>
      </Box>
      {renderMonthDates()}
      {renderProjectNames()}
      {renderProjects()}
      {renderEngagements()}
    </Box>
  );
};

export default React.memo(Month);
