import { Grid } from "@mui/material";
import NoResultsFound from "../NoResultsFound";
import Card from "./Card";
import { useContext } from "react";
import { MyWorkplansContext } from "./MyWorkPlanContext";
import { CardListSkeleton } from "./CardListSkeleton";
import { Unless } from "react-if";
import { throttle } from "lodash";
import TriggerOnViewed from "../shared/DummyElement";

const CardList = () => {
  const { workplans, loadingWorkplans, totalWorkplans, lazyLoadMoreWorkplans } =
    useContext(MyWorkplansContext);

  const throttledLazyLoadWorkplans = throttle(() => {
    lazyLoadMoreWorkplans();
  }, 5000);

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
          <Grid item xs={4}>
            <Card workplan={workplan} />
          </Grid>
        );
      })}
      <Unless
        condition={loadingWorkplans || workplans.length === totalWorkplans}
      >
        <TriggerOnViewed callbackFn={throttledLazyLoadWorkplans} />
      </Unless>
      <Unless condition={workplans.length === totalWorkplans}>
        <CardListSkeleton />
      </Unless>
    </Grid>
  );
};

export default CardList;
