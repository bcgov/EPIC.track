// TaskBar.js
import moment from "moment";
import { dayWidth } from "./constants";
import { GanttItem } from "./types";
import { ETCaption3 } from "components/shared";
import { useGanttContext } from "./GanttContext";
import TaskBarTooltip from "./TaskBarTooltip";

type TaskBar = {
  task: GanttItem;
};

const TaskBar = ({ task }: TaskBar) => {
  const { start, CustomTaskBarTooltip } = useGanttContext();
  const momentStart = moment(start);
  const momentTaskStart = moment(task.start);
  const daysDiff = momentTaskStart.diff(momentStart, "days");

  const taskSpan = moment(task.end).diff(moment(task.start), "days") + 1;

  const TooltipWrapper = !!CustomTaskBarTooltip
    ? CustomTaskBarTooltip
    : TaskBarTooltip;

  return (
    <div
      style={{
        left: `${daysDiff * dayWidth}px`,
        height: "100%",
        position: "absolute",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <TooltipWrapper task={task}>
        <div
          id="task-bar"
          style={{
            width: `${taskSpan * dayWidth}px`,
            backgroundColor: `${task.style.bar.backgroundColor}`,
            borderBottom: `${task.style.bar.borderBottom}`,
            height: "70%",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingLeft: "8px",
            paddingRight: "8px",
            gap: 2,
            overflow: "hidden",
            borderRadius: "4px",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          <ETCaption3
            sx={{
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              overflow: "hidden",
              width: !task.progress ? "100%" : "50%",
            }}
          >
            {task.name}
          </ETCaption3>
          {Boolean(task.progress) && (
            <ETCaption3
              sx={{
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                overflow: "hidden",

                ...(task.style.progress || {}),
              }}
              bold
            >
              {task.progress}
            </ETCaption3>
          )}
        </div>
      </TooltipWrapper>
    </div>
  );
};

export default TaskBar;
