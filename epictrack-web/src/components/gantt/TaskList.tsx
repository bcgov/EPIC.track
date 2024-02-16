// TaskList.js
import React from "react";
import { TaskParent } from "./types";
import { barHeight, rowHeight, sectionHeight } from "./constants";
import { ETParagraph } from "components/shared";
import { Palette } from "styles/theme";
import { ScrollSyncPane } from "react-scroll-sync";

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
      <ScrollSyncPane group="horizontal">
        <div style={{ height: sectionHeight, overflow: "hidden" }}>
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
      </ScrollSyncPane>
    </div>
  );
};

export default TaskList;
