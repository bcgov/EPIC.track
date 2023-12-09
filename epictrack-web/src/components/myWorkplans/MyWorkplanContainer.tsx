import { ETPageContainer } from "../shared";
import CardList from "./CardList";
import { Grid } from "@mui/material";
import Filters from "./Filters";
import { AssigneeToggle } from "./Filters/AssigneeToggle";

const WorkPlanContainer = () => {
  return (
    <ETPageContainer container spacing={2}>
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
