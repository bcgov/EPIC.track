import React from "react";
import { MyWorkplansProvider } from "./MyWorkPlanContext";
import WorkPlanContainer from "./MyWorkplanContainer";

const MyWorkPlans = () => {
  return (
    <MyWorkplansProvider>
      <WorkPlanContainer />
    </MyWorkplansProvider>
  );
};

export default MyWorkPlans;
