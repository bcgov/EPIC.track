import { useContext } from "react";
import { ETPageContainer } from "../shared";
import { MyWorkplansContext } from "./MyWorkPlanContext";
import CardList from "./CardList";
import TopFilters from "./TopFilters";

const WorkPlanContainer = () => {
  const {} = useContext(MyWorkplansContext);

  return (
    <>
      <TopFilters />
      <ETPageContainer
        sx={{
          paddingBottom: "0rem !important",
        }}
      >
        <CardList />
      </ETPageContainer>
    </>
  );
};

export default WorkPlanContainer;
