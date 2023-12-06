import { Grid } from "@mui/material";
import NoResultsFound from "../NoResultsFound";
import Card from "./Card";
import { useContext } from "react";
import { MyWorkplansContext } from "./MyWorkPlanContext";

const CardList = () => {
  const { workplans } = useContext(MyWorkplansContext);

  if (workplans.length === 0) {
    return <NoResultsFound />;
  }

  return (
    <Grid container direction="row" spacing={2} columns={{ xs: 12 }}>
      {workplans.map((workplan) => {
        return (
          <Grid item xs={4}>
            <Card workplan={workplan} />
          </Grid>
        );
      })}
    </Grid>
  );
};

export default CardList;
