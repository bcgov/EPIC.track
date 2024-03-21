import { useContext, useEffect } from "react";
import { MyWorkplansContext } from "../MyWorkPlanContext";
import moment from "moment";
import { Palette } from "styles/theme";
import { Gantt } from "components/gantt";
import Color from "color";
import { useNavigate } from "react-router-dom";
import { WORKPLAN_TAB_INDEX } from "components/workPlan/constants";
import { getDaysLeft } from "./util";

export const MyWorkplanGantt = () => {
  const { workplans, setLoadingMoreWorkplans, totalWorkplans } =
    useContext(MyWorkplansContext);
  const navigate = useNavigate();

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
          progress: getDaysLeft(phaseInfo),
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
      onClick: () => {
        navigate(`/work-plan?work_id=${workplan.id}`, {
          state: { tabIndex: WORKPLAN_TAB_INDEX.ABOUT },
        });
      },
    };
  });

  return (
    <Gantt
      rows={tasks}
      enableLazyLoading
      onLazyLoad={() => setLoadingMoreWorkplans(true)}
      totalRows={totalWorkplans}
    />
  );
};
