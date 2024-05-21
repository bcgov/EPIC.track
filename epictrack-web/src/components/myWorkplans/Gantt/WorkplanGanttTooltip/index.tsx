import { TrackTooltip } from "components/common/TrackTooltip";
import { TaskBarTooltipProps } from "components/gantt";
import { TooltipBody } from "./Body";

const WorkplanGanttTooltip = ({ task, children }: TaskBarTooltipProps) => {
  return (
    <TrackTooltip followCursor body={<TooltipBody task={task} />}>
      {children}
    </TrackTooltip>
  );
};

export default WorkplanGanttTooltip;
