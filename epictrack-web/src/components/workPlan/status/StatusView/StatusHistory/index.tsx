import React from "react";
import { Box } from "@mui/material";
import { WorkplanContext } from "../../../WorkPlanContext";
import { Status } from "../../../../../models/status";
import { ETCaption1 } from "../../../../shared";
import Timeline from "@mui/lab/Timeline";
import HistoryItem from "./HistoryItem";
import { If, Then } from "react-if";

const StatusHistory = () => {
  const { statuses } = React.useContext(WorkplanContext);

  return (
    <Box sx={{ width: "50%" }}>
      <ETCaption1 bold sx={{ letterSpacing: "0.39px", paddingBottom: "16px" }}>
        STATUS HISTORY
      </ETCaption1>
      <Timeline position="left" sx={{ overflowY: "scroll", flex: 1 }}>
        {statuses.map((status: Status) => (
          <If condition={status.is_approved && statuses[0].id !== status.id}>
            <Then>
              <HistoryItem status={status} />
            </Then>
          </If>
        ))}
      </Timeline>
    </Box>
  );
};

export default StatusHistory;
