import { Box, Button, Grid } from "@mui/material";
import { FC, useEffect, useState } from "react";
import { Palette } from "styles/theme";
import { IconProps } from "../icons/type";
import Icons from "../icons";
import EventRow from "./EventRow";
import MonthDatesRow from "./MonthDatesRow";
import { CalendarEvent } from "models/event";
import MonthWorkLegendItem from "./Legends/MonthWorkLegendItem";

const ExpandIcon: FC<IconProps> = Icons["ExpandIcon"];
const CollapseIcon: FC<IconProps> = Icons["CollapseIcon"];

type CalendarWork = {
  id: number;
  title: string;
};

type MonthProps = {
  monthLabel: string;
  labelWidth: number;
  days: (Date | null)[];
  isCollapsed: boolean;
  toggleCollapsed: () => void;
  cellSizePx: number;
  daysInRow: number;
  milestoneEvents?: CalendarEvent[];
  showWorkLegend?: boolean;
};

const Month: FC<MonthProps> = ({
  monthLabel,
  labelWidth,
  days,
  isCollapsed,
  toggleCollapsed,
  cellSizePx,
  daysInRow,
  milestoneEvents: events,
  showWorkLegend = false,
}) => {
  const [works, setWorks] = useState<CalendarWork[]>([]);

  useEffect(() => {
    const uniqueWorks = Array.from(
      new Set(events?.map((event) => event.work_id))
    ).map((workId) => {
      const event = events?.find((event) => event.work_id === workId);
      return {
        id: workId,
        title: event ? event.work_name : "Unknown Work",
      };
    });
    setWorks(uniqueWorks);
  }, [events]);

  return (
    <Box display="flex" alignItems="stretch" gap={0.5}>
      <Box
        sx={{
          width: `${labelWidth}px`,
          backgroundColor: Palette.neutral.bg.light,
          flexShrink: 0,
          display: "flex",
          alignItems: "flex-start",
          flexDirection: "column",
        }}
      >
        <Button
          onClick={toggleCollapsed}
          variant="contained"
          disableElevation
          size="small"
          sx={{
            width: "100%",
            padding: "0 0 0 0.5rem",
            lineHeight: 1,
            minHeight: `${cellSizePx}px`,
            backgroundColor: Palette.neutral.bg.light,
            color: Palette.neutral.dark,
            borderRadius: 1,
            textTransform: "none",
            alignItems: "center",
            justifyContent: "flex-start",
            "&:hover": {
              backgroundColor: Palette.neutral.bg.light,
            },
          }}
          startIcon={isCollapsed ? <ExpandIcon /> : <CollapseIcon />}
        >
          {monthLabel}
        </Button>
        {!isCollapsed && showWorkLegend && (
          <Grid
            container
            direction="row"
            spacing={0}
            sx={{ padding: "0.275rem" }}
          >
            {works.map((work) => (
              <MonthWorkLegendItem
                name={work.title}
                key={work.id}
                work_id={work.id}
              />
            ))}
          </Grid>
        )}
      </Box>
      <Box
        display="grid"
        gridTemplateColumns={`repeat(${daysInRow}, ${cellSizePx}px)`}
        gridAutoRows="auto"
        gap={0.5}
        flexGrow={1}
        alignContent={"start"}
      >
        <MonthDatesRow
          days={days}
          cellSizePx={cellSizePx}
          events={events || []}
        />
        {!isCollapsed && (
          <EventRow
            events={events ?? []}
            days={days}
            cellSizePx={cellSizePx}
            showWorkLegend={showWorkLegend}
          />
        )}
      </Box>
    </Box>
  );
};

export default Month;
