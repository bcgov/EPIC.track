import { useContext } from "react";
import { ETPageContainer } from "../shared";
import { MyWorkplansContext } from "./MyWorkPlanContext";

const WorkPlanContainer = () => {
  const {} = useContext(MyWorkplansContext);

  return (
    <ETPageContainer
      sx={{
        paddingBottom: "0rem !important",
      }}
    ></ETPageContainer>
  );
};

export default WorkPlanContainer;
