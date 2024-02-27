import { Button } from "@mui/material";
import React from "react";
import { useGanttContext } from "./GanttContext";
import { scrollToToday } from "./utils";

const ControlBar = () => {
  const { ganttChartRef, start } = useGanttContext();
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: "1em",
        width: "100%",
      }}
    >
      <Button onClick={() => scrollToToday(start, ganttChartRef)}>Today</Button>
    </div>
  );
};

export default ControlBar;
