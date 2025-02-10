import { WorkplanProvider } from "./WorkPlanContext";
import WorkPlanContainer from "./WorkPlanContainer";

const WorkPlan = () => {
  return (
    <WorkplanProvider>
      <WorkPlanContainer />
    </WorkplanProvider>
  );
};

export default WorkPlan;
