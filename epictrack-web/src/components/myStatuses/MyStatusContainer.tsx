import { ETPageContainer } from "../shared";
import CardList from "../myStatuses/CardList";
import { Grid, Stack, useTheme } from "@mui/material";
import Filters from "./Filters";
import { useAppSelector } from "hooks";
import { getTotalHeaderHeight } from "components/layout/Header/constants";
import { AssigneeToggle } from "../myWorkplans/Filters/AssigneeToggle";
import { useContext } from "react";
import { MyStatusesContext } from "./MyStatusContext";

const StatusContainer = () => {
  const { showEnvBanner } = useAppSelector((state) => state.uiState);
  const { searchOptions, setSearchOptions, totalStatuses, loadingStatuses } =
    useContext(MyStatusesContext);

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
          <Stack direction={"row"} spacing={1}>
            <AssigneeToggle
              searchOptions={searchOptions}
              setSearchOptions={setSearchOptions}
              total={totalStatuses}
              loading={loadingStatuses}
              label="Statuses"
            />
          </Stack>
        </Grid>
        <Grid item xs={12}>
          <Filters />
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <CardList />
      </Grid>
    </ETPageContainer>
  );
};

export default StatusContainer;
