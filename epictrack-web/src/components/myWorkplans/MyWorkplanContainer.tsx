import { useContext } from "react";
import { ETPageContainer } from "../shared";
import { MyWorkplansContext } from "./MyWorkPlanContext";
import CardList from "./CardList";
import { Grid } from "@mui/material";
import Filters from "./Filters";
import { AssigneeToggle } from "./Filters/AssigneeToggle";
import DummyElement from "../shared/DummyElement";
import throttle from "lodash/throttle";

const WorkPlanContainer = () => {
  const { loadMoreWorkplans, loadingWorkplans } =
    useContext(MyWorkplansContext);

  const callbackFn = throttle(() => {
    if (loadingWorkplans) return;
    loadMoreWorkplans();
  }, 2000);

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
        <DummyElement callbackFn={callbackFn} />
      </ETPageContainer>
    </>
  );
};

export default WorkPlanContainer;
