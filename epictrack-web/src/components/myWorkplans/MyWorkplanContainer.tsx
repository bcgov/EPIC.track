import { ETPageContainer } from "../shared";
import CardList from "./CardList";
import { Grid } from "@mui/material";
import Filters from "./Filters";
import { Toolbar } from "./Toolbar";
import { MyWorkplansContext } from "./MyWorkPlanContext";
import { useContext } from "react";
import { When } from "react-if";
import { MY_WORKPLAN_VIEW } from "./type";
import { MyWorkplanGantt } from "./Gantt";

const WorkPlanContainer = () => {
  const { myWorkPlanView } = useContext(MyWorkplansContext);
  return (
    <ETPageContainer container spacing={2}>
      <Grid item xs={12} container justifyContent={"flex-end"}>
        <Toolbar />
      </Grid>
      <Grid item xs={12}>
        <Filters />
      </Grid>
      <Grid item xs={12}>
        <When condition={myWorkPlanView === MY_WORKPLAN_VIEW.CARDS}>
          <CardList />
        </When>
        <When condition={myWorkPlanView === MY_WORKPLAN_VIEW.GANTT}>
          <MyWorkplanGantt />
        </When>
      </Grid>
    </ETPageContainer>
  );
};

export default WorkPlanContainer;
