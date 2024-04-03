import React from "react";
import { Chart } from "./Chart";
import ControlBar from "./ControlBar";
import { useGanttContext } from "./GanttContext";

const Main = () => {
  const { rows } = useGanttContext();

  if (!rows.length) {
    return null;
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "flex-start",
        gap: "1em",
      }}
    >
      <div style={{ width: "100%" }}>
        <ControlBar />
      </div>
      <div style={{ width: "100%" }}>
        <Chart />
      </div>
    </div>
  );
};

export default Main;
