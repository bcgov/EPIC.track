import { Grid } from "@mui/material";
import NoResultsFound from "../NoResultsFound";
import StatusCard from "./StatusCard";
import { useContext } from "react";
import { MyStatusesContext } from "./MyStatusContext";
import { CardListSkeleton } from "../myWorkplans/CardListSkeleton";
import { Unless } from "react-if";
import TriggerOnViewed from "../shared/DummyElement";

const CardList = () => {
  const {
    statuses,
    loadingStatuses,
    totalStatuses,
    loadingMoreStatuses,
    setLoadingMoreStatuses,
    statusStalenessSettings,
  } = useContext(MyStatusesContext);

  if (loadingStatuses) {
    return (
      <Grid container spacing={2}>
        <CardListSkeleton />
      </Grid>
    );
  }

  if (statuses.length === 0) {
    return <NoResultsFound />;
  }

  return (
    <Grid container spacing={2}>
      {statuses.map((status) => {
        return (
          <Grid key={status.work_id} item xs={4}>
            <StatusCard
              status={status}
              statusStalenessSettings={statusStalenessSettings}
            />
          </Grid>
        );
      })}
      <Unless
        condition={
          loadingStatuses ||
          loadingMoreStatuses ||
          statuses.length === totalStatuses
        }
      >
        <TriggerOnViewed
          callbackFn={() => {
            setLoadingMoreStatuses(true);
          }}
        />
      </Unless>
      <Unless condition={statuses.length === totalStatuses}>
        <CardListSkeleton />
      </Unless>
    </Grid>
  );
};

export default CardList;
