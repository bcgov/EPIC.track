import { useContext } from "react";
import { MyWorkplansContext } from "../MyWorkPlanContext";
import moment from "moment";
import { Palette } from "styles/theme";
import { Gantt } from "components/gantt";

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
          progress: `${Math.abs(phase.days_left)}/${
            phase.total_number_of_days
          }`,
          progressProps: {
            color:
              phase.days_left > 0 ? Palette.success.main : Palette.error.main,
          },
        };
      }),
    };
  });

  return <Gantt parents={tasks} />;
};
