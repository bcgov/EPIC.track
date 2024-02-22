import { useContext } from "react";
import { MyWorkplansContext } from "../MyWorkPlanContext";
import moment from "moment";
import { Palette } from "styles/theme";
import { Gantt } from "components/gantt";
import Color from "color";

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
      tasks: phaseInfo.map((phaseInfo: any) => {
        return {
          id: phaseInfo.work_phase.name,
          name: phaseInfo.work_phase.name,
          start: moment(phaseInfo.work_phase.start_date).toDate(),
          end: moment(phaseInfo.work_phase.end_date).toDate(),
          progress: `${Math.abs(phaseInfo.days_left)}/${
            phaseInfo.total_number_of_days
          }`,
          style: {
            bar: {
              backgroundColor: Color(phaseInfo.work_phase.phase.color)
                .alpha(0.25)
                .string(),
              borderBottom: `2px solid ${phaseInfo.work_phase.phase.color}`,
            },
            progress: {
              color:
                phaseInfo.days_left > 0
                  ? Palette.success.main
                  : Palette.error.main,
            },
          },
        };
      }),
    };
  });

  return <Gantt rows={tasks} />;
};
