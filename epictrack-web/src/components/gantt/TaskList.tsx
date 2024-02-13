// TaskList.js
import React from "react";

type TaskListProps = {
  tasks: any[];
};

const TaskList = ({ tasks }: TaskListProps) => {
  return (
    <div>
      {tasks.map((task) => (
        <div key={task.id} style={{ height: "30px", lineHeight: "30px" }}>
          {task.name}
        </div>
      ))}
    </div>
  );
};

export default TaskList;
