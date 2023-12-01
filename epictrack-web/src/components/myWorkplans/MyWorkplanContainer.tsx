import { useContext } from "react";
import { ETPageContainer } from "../shared";
import { MyWorkplansContext } from "./MyWorkPlanContext";
import CardList from "./CardList";
import { Grid } from "@mui/material";
import Filters from "./Filters";
import { AssigneeToggle } from "./Filters/AssigneeToggle";

const WorkPlanContainer = () => {
  const {} = useContext(MyWorkplansContext);

  return (
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
    </ETPageContainer>
  );
};

export default WorkPlanContainer;
