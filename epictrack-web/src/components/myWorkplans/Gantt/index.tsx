import { Gantt } from "components/Gantt";
import { TaskParent } from "components/Gantt/types";

export const MyWorkplanGantt = () => {
  const mockTasks: TaskParent[] = [
    {
      id: "1",
      name: "Task 1",
      tasks: [
        {
          id: "1",
          name: "Task 1",
          start: new Date("2023-02-02"),
          end: new Date("2023-02-28"),
          progress: 0.5,
        },
        {
          id: "1.5",
          name: "Task 11.5",
          start: new Date("2023-02-02"),
          end: new Date("2023-04-28"),
          progress: 0.5,
        },
      ],
    },
    {
      id: "2",
      name: "Task 2",
      tasks: [
        {
          id: "2",
          name: "Task 2",
          start: new Date("2023-09-06"),
          end: new Date("2023-10-10"),
          progress: 0.5,
        },
      ],
    },
    {
      id: "3",
      name: "Task 3",
      tasks: [
        {
          id: "3",
          name: "Task 3",
          start: new Date("2023-10-11"),
          end: new Date("2023-11-15"),
          progress: 0.5,
        },
      ],
    },
    {
      id: "4",
      name: "Task 4",
      tasks: [
        {
          id: "4",
          name: "Task 4",
          start: new Date("2024-02-11"),
          end: new Date("2024-07-15"),
          progress: 0.5,
        },
      ],
    },
    {
      id: "5",
      name: "Task 5",
      tasks: [
        {
          id: "5",
          name: "Task 5",
          start: new Date("2024-03-11"),
          end: new Date("2024-04-15"),
          progress: 0.5,
        },
      ],
    },
    {
      id: "6",
      name: "Task 6",
      tasks: [
        {
          id: "6",
          name: "Task 6",
          start: new Date("2025-03-11"),
          end: new Date("2025-04-15"),
          progress: 0.5,
        },
      ],
    },
  ];

  return <Gantt parents={mockTasks} />;
};
