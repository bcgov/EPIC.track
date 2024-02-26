// TaskList.js
import React from "react";
import { barHeight, taskListWidth } from "./constants";
import { ETParagraph } from "components/shared";
import { Skeleton } from "@mui/material";

const TaskListSkeleton = () => {
  return (
    <>
      {[1, 2, 3, 4].map((_, index) => (
        <div
          key={index}
          style={{
            height: barHeight,
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-start",
            alignItems: "center",
            paddingLeft: "1em",
            width: "100%",
          }}
        >
          <ETParagraph>
            <Skeleton variant="text" width={taskListWidth * 0.8} />
          </ETParagraph>
        </div>
      ))}
    </>
  );
};

export default TaskListSkeleton;
