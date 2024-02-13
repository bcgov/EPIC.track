// TaskBarSection.js
import React from "react";
import TaskBar from "./TaskBar";

type TaskBarSectionProps = {
  tasks: any[];
};

const TaskBarSection = ({ tasks }: TaskBarSectionProps) => {
  return (
    <div>
      {tasks.map((task) => (
        <div key={task.id} style={{ height: "30px" }}>
          <TaskBar task={task} />
        </div>
      ))}
    </div>
  );
};

export default TaskBarSection;
