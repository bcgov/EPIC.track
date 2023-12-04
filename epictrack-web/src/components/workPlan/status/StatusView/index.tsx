import React, { useMemo } from "react";
import NoDataEver from "../../../shared/NoDataEver";
import { WorkplanContext } from "../../WorkPlanContext";
import { StatusContext } from "../StatusContext";
import RecentStatus from "./RecentStatus";
import { Box, Grid } from "@mui/material";
import StatusHistory from "./StatusHistory";
import WarningBox from "../../../shared/warningBox";
import { dateUtils } from "../../../../utils";
import moment from "moment";
import { When } from "react-if";

const StatusView = () => {
  const { statuses } = React.useContext(WorkplanContext);
  const { setShowStatusForm } = React.useContext(StatusContext);

  const onAddButtonClickHandler = () => {
    setShowStatusForm(true);
  };

  const STATUS_DATE_THRESHOLD = 7;

  const isStatusOutOfDate = () => {
    const lastApprovedStatus = statuses.find((status) => status.is_approved);

    if (!lastApprovedStatus) {
      return false;
    }

    const daysAgo = moment().subtract(STATUS_DATE_THRESHOLD, "days");
    const NDaysAgo = dateUtils.diff(
      daysAgo.toLocaleString(),
      lastApprovedStatus?.posted_date,
      "days"
    );

    return NDaysAgo > 0;
  };

  return (
    <>
      <When condition={statuses.length === 0}>
        <NoDataEver
          title="You don't have any Statuses yet"
          subTitle="Create your first Status"
          addNewButtonText="Add Status"
          onAddNewClickHandler={() => onAddButtonClickHandler()}
        />
      </When>
      <When condition={isStatusOutOfDate()}>
        <Box sx={{ paddingBottom: "16px" }}>
          <WarningBox
            title="The Work status is out of date"
            subTitle="Please provide an updated status"
            isTitleBold={true}
          />
        </Box>
      </When>
      <Grid container spacing={2}>
        <When condition={statuses.length > 0}>
          <Grid item xs={6}>
            <RecentStatus />
          </Grid>
        </When>
        <When condition={statuses.length > 1}>
          <Grid item xs={6}>
            <StatusHistory />
          </Grid>
        </When>
      </Grid>
    </>
  );
};

export default StatusView;
