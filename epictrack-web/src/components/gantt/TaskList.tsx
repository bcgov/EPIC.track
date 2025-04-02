// TaskList.js
import { barHeight, rowHeight, taskListWidth } from "./constants";
import { ETParagraph } from "components/shared";
import { Palette } from "styles/theme";
import TaskListSkeleton from "./TaskListSkeleton";
import { useGanttContext } from "./GanttContext";
import TriggerOnViewed from "components/shared/DummyElement";
import { Tooltip } from "@mui/material";

const TaskList = () => {
  const { rows } = useGanttContext();
  const {
    enableLazyLoading,
    totalRows,
    onLazyLoad = () => {
      return;
    },
    isLoadingMore,
  } = useGanttContext();
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        position: "sticky",
        left: 0,
        backgroundColor: Palette.neutral.bg.light,
        boxShadow: "rgba(0, 0, 0, 0.2) 3px 0px 3px -3px",
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
          boxShadow: "rgba(0, 0, 0, 0.2) 0px 3px 3px -3px",
        }}
      >
        <ETParagraph bold>Works</ETParagraph>
      </div>
      <div
        style={{
          zIndex: 1,
          // add box shadow to the right of the task list
        }}
      >
        {rows.map((row) => (
          <div
            key={row.id}
            style={{
              height: barHeight,
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-start",
              alignItems: "center",
              paddingLeft: "1em",
            }}
          >
            <Tooltip title={row.name}>
              <ETParagraph
                color={Palette.primary.accent.main}
                sx={{
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  width: 0.8 * taskListWidth,
                  cursor: row.onClick ? "pointer" : "default",
                }}
                onClick={row.onClick}
              >
                {row.name}
              </ETParagraph>
            </Tooltip>
          </div>
        ))}
      </div>

      {enableLazyLoading && (
        <>
          {!isLoadingMore && totalRows !== rows.length && (
            <TriggerOnViewed callbackFn={() => onLazyLoad()} />
          )}
          {totalRows !== rows.length && (
            <div
              style={{
                zIndex: 1,
              }}
            >
              <TaskListSkeleton />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TaskList;
