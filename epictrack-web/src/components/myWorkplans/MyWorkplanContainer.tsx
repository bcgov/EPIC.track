import { ETPageContainer } from "../shared";
import CardList from "./CardList";
import { Grid, useTheme } from "@mui/material";
import Filters from "./Filters";
import { Toolbar } from "./Toolbar";
import { MyWorkplansContext } from "./MyWorkPlanContext";
import { useContext } from "react";
import { When } from "react-if";
import { MY_WORKPLAN_VIEW } from "./type";
import { MyWorkplanGantt } from "./Gantt";
import { useAppSelector } from "hooks";
import { getTotalHeaderHeight } from "components/layout/Header/constants";

const WorkPlanContainer = () => {
  const { myWorkPlanView } = useContext(MyWorkplansContext);
  const { showEnvBanner } = useAppSelector((state) => state.uiState);

  const theme = useTheme();

  return (
    <ETPageContainer container spacing={2}>
      <Grid
        item
        xs={12}
        container
        spacing={2}
        sx={{
          position: "sticky",
          zIndex: theme.zIndex.appBar,
          top: getTotalHeaderHeight(showEnvBanner),
          backgroundColor: "white",
          paddingBottom: "1em",
        }}
      >
        <Grid item xs={12} container justifyContent={"flex-end"}>
          <Toolbar />
        </Grid>
        <Grid item xs={12}>
          <Filters />
        </Grid>
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
