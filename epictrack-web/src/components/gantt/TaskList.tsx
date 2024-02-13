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
        position: "relative",
        backgroundColor: Palette.neutral.bg.light,
        height: "100%",
      }}
    >
      <div
        style={{
          height: rowHeight * 2,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          paddingLeft: "1em",
        }}
      >
        <ETParagraph bold>Works</ETParagraph>
      </div>
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
          }}
        >
          <ETParagraph color={Palette.primary.accent.main}>
            {parent.name}
          </ETParagraph>
        </div>
      ))}
    </div>
  );
};

export default TaskList;
