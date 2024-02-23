// TaskBarSection.js
import React from "react";
import TaskBar from "./TaskBar";
import { GanttRow } from "./types";
import { barHeight } from "./constants";
import { Palette } from "styles/theme";
import { Skeleton } from "@mui/material";

const TaskBarSectionSkeleton = () => {
  return (
    <div
      style={{
        backgroundColor: Palette.neutral.bg.light,
      }}
    >
      {[1, 2, 3, 4].map((row, index) => (
        <div
          style={{
            height: barHeight,
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Skeleton
            key={index}
            variant="rectangular"
            width="90%"
            height={"70%"}
            sx={{ borderRadius: "4px" }}
          />
        </div>
      ))}
    </div>
  );
};

export default TaskBarSectionSkeleton;
