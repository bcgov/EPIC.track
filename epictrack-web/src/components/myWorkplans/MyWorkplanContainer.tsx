import { useContext, useRef } from "react";
import { ETPageContainer } from "../shared";
import { MyWorkplansContext } from "./MyWorkPlanContext";
import CardList from "./CardList";
import { Grid } from "@mui/material";
import Filters from "./Filters";
import { AssigneeToggle } from "./Filters/AssigneeToggle";
import { useOnScreen } from "../../hooks";

const WorkPlanContainer = () => {
  const { loadMoreWorkplans, loadingWorkplans } =
    useContext(MyWorkplansContext);
  const ref = useRef<HTMLDivElement>(null);
  const isVisible = useOnScreen(ref);

  if (isVisible && !loadingWorkplans) {
    setTimeout(() => loadMoreWorkplans(), 250);
  }

  return (
    <>
      <ETPageContainer
        sx={{
          paddingBottom: "0rem !important",
        }}
        container
        spacing={2}
      >
        <Grid item xs={12} container justifyContent={"flex-end"}>
          <AssigneeToggle />
        </Grid>
        <Grid item xs={12}>
          <Filters />
        </Grid>
        <Grid item xs={12}>
          <CardList />
        </Grid>
        <Grid item ref={ref} />
      </ETPageContainer>
    </>
  );
};

export default WorkPlanContainer;
