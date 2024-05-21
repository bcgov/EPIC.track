import React from "react";
import { GanttItem } from "components/gantt/types";
import { Case, Switch } from "react-if";
import { CompletedPhase } from "./CompletedPhase";
import { FuturePhase } from "./FuturePhase";
import { CurrentPhase } from "./CurrentPhase";

export const TooltipBody = ({ task }: { task: GanttItem }) => {
  return (
    <Switch>
      <Case condition={task.is_completed}>
        <CompletedPhase task={task} />
      </Case>
      <Case condition={task.is_current}>
        <CurrentPhase task={task} />
      </Case>
      <Case condition={!task.is_completed && !task.is_current}>
        <FuturePhase task={task} />
      </Case>
    </Switch>
  );
};
