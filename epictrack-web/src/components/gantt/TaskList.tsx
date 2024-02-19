// TaskList.js
import React from "react";
import { TaskParent } from "./types";
import { barHeight, rowHeight } from "./constants";
import { ETParagraph } from "components/shared";
import { Palette } from "styles/theme";

type TaskListProps = {
  parents: TaskParent[];
};

const TaskList = ({ parents }: TaskListProps) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        position: "sticky",
        left: 0,
        backgroundColor: Palette.neutral.bg.light,
      }}
    >
      <div
        style={{
          height: rowHeight * 2,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          paddingLeft: "1em",
          position: "sticky",
          top: 0,
          zIndex: 2,
          backgroundColor: Palette.neutral.bg.light,
        }}
      >
        <ETParagraph bold>Works</ETParagraph>
      </div>
      <div
        style={{
          zIndex: 1,
        }}
      >
        {parents.map((parent) => (
          <div
            key={parent.id}
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
            <ETParagraph
              color={Palette.primary.accent.main}
              sx={{
                textOverflow: "ellipsis",
                overflow: "hidden",
              }}
            >
              {parent.name}
            </ETParagraph>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskList;
