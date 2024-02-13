import { Gantt } from "components/Gantt";
import { Task } from "components/Gantt/types";

export const MyWorkplanGantt = () => {
  const mockTasks: Task[] = [
    {
      id: "1",
      name: "Task 1",
      start: new Date("2023-02-03"),
      end: new Date("2023-02-05"),
      progress: 0.5,
    },
    {
      id: "2",
      name: "Task 2",
      start: new Date("2023-09-06"),
      end: new Date("2023-09-10"),
      progress: 0.5,
    },
    {
      id: "3",
      name: "Task 3",
      start: new Date("2023-10-11"),
      end: new Date("2023-10-15"),
      progress: 0.5,
    },
    {
      id: "4",
      name: "Task 4",
      start: new Date("2024-02-11"),
      end: new Date("2024-02-15"),
      progress: 0.5,
    },
    {
      id: "5",
      name: "Task 5",
      start: new Date("2024-03-11"),
      end: new Date("2024-02-15"),
      progress: 0.5,
    },
  ];
  return <Gantt tasks={mockTasks} />;
};
