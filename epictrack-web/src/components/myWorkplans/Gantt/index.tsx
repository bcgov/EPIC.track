import { Gantt } from "components/Gantt";
import { useContext } from "react";
import { MyWorkplansContext } from "../MyWorkPlanContext";
import moment from "moment";

export const MyWorkplanGantt = () => {
  const { workplans } = useContext(MyWorkplansContext);

  const tasks = workplans.map((workplan) => {
    let phaseInfo: any;
    if (!Array.isArray(workplan.phase_info)) {
      phaseInfo = [workplan.phase_info];
    } else {
      phaseInfo = workplan.phase_info;
    }

    return {
      id: String(workplan.id),
      name: workplan.title,
      tasks: phaseInfo.map((phase: any) => {
        return {
          id: phase.work_phase.name,
          name: phase.work_phase.name,
          start: moment(phase.work_phase.start_date).toDate(),
          end: moment(phase.work_phase.end_date).toDate(),
          progress: phase.milestone_progress,
        };
      }),
    };
  });

  return <Gantt parents={tasks} />;
};
