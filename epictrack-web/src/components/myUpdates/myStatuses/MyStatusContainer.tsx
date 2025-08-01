import { useContext } from "react";
import CardList from "../CardList";
import { Grid } from "@mui/material";
import { MyStatusesContext } from "./MyStatusContext";
import StatusCard from "./StatusCard";

const StatusContainer = () => {
  const {
    statuses,
    loadingStatuses,
    totalStatuses,
    loadingMoreStatuses,
    setLoadingMoreStatuses,
    statusStalenessSettings,
  } = useContext(MyStatusesContext);

  return (
    <Grid item xs={12}>
      <CardList
        items={statuses}
        totalItems={totalStatuses}
        loading={loadingStatuses}
        loadingMore={loadingMoreStatuses}
        setLoadingMore={setLoadingMoreStatuses}
        CardComponent={StatusCard}
        cardProps={{ statusStalenessSettings }}
      />
    </Grid>
  );
};

export default StatusContainer;
