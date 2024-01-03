import { Grid } from "@mui/material";
import NoResultsFound from "../NoResultsFound";
import Card from "./Card";
import { useContext } from "react";
import { MyWorkplansContext } from "./MyWorkPlanContext";
import { CardListSkeleton } from "./CardListSkeleton";
import { Unless } from "react-if";
import TriggerOnViewed from "../shared/DummyElement";

const CardList = () => {
  const {
    workplans,
    loadingWorkplans,
    totalWorkplans,
    loadingMoreWorkplans,
    setLoadingMoreWorkplans,
  } = useContext(MyWorkplansContext);

  if (loadingWorkplans) {
    return (
      <Grid container spacing={2}>
        <CardListSkeleton />
      </Grid>
    );
  }

  if (workplans.length === 0) {
    return <NoResultsFound />;
  }

  return (
    <Grid container spacing={2}>
      {workplans.map((workplan) => {
        return (
          <Grid key={workplan.id} item xs={4}>
            <Card workplan={workplan} />
          </Grid>
        );
      })}
      <Unless
        condition={
          loadingWorkplans ||
          loadingMoreWorkplans ||
          workplans.length === totalWorkplans
        }
      >
        <TriggerOnViewed
          callbackFn={() => {
            setLoadingMoreWorkplans(true);
          }}
        />
      </Unless>
      <Unless condition={workplans.length === totalWorkplans}>
        <CardListSkeleton />
      </Unless>
    </Grid>
  );
};

export default CardList;
