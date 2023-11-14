import React from "react";
import NoDataEver from "../../../shared/NoDataEver";
import { WorkplanContext } from "../../WorkPlanContext";
import { StatusContext } from "../StatusContext";
import StatusOutOfDateBanner from "./StatusOutOfDateBanner";
import RecentStatus from "./RecentStatus";
import { Box } from "@mui/material";
import StatusHistory from "./StatusHistory";
import { Status } from "../../../../models/status";

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
      {statuses.length > 0 && !statuses[0].is_approved && (
        <StatusOutOfDateBanner />
      )}
      <Box sx={{ display: "flex", gap: "24px" }}>
        {statuses.length > 0 && <RecentStatus />}
        {statuses.length > 1 && <StatusHistory />}
      </Box>
    </>
  );
};

export default StatusView;
