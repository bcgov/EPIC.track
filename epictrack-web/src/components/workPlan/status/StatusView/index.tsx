import React from "react";
import NoDataEver from "../../../shared/NoDataEver";
import { WorkplanContext } from "../../WorkPlanContext";
import { StatusContext } from "../StatusContext";
import RecentStatus from "./RecentStatus";
import { Box, Grid } from "@mui/material";
import StatusHistory from "./StatusHistory";
import WarningBox from "../../../shared/warningBox";

const StatusView = () => {
  const { statuses } = React.useContext(WorkplanContext);
  const { setShowStatusForm } = React.useContext(StatusContext);

  const onAddButtonClickHandler = () => {
    setShowStatusForm(true);
  };

  return (
    <>
      {statuses.length === 0 && (
        <NoDataEver
          title="You don't have any Statuses yet"
          subTitle="Create your first Status"
          addNewButtonText="Add Status"
          onAddNewClickHandler={() => onAddButtonClickHandler()}
        />
      )}
      {statuses.length != 0 && !statuses[0].is_approved && (
        <Box sx={{ paddingBottom: "16px" }}>
          <WarningBox
            title="The Work status is out of date"
            subTitle="Please provide an updated status"
            isTitleBold={true}
          />
        </Box>
      )}
      <Grid container spacing={2}>
        <Grid item xs={6}>
          {statuses.length > 0 && <RecentStatus />}
        </Grid>
        <Grid item xs={6}>
          {statuses.length > 1 && <StatusHistory />}
        </Grid>
      </Grid>
    </>
  );
};

export default StatusView;
