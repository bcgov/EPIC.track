import React from "react";
import { Box } from "@mui/material";
import moment from "moment";
import { ETCaption1, DashedBorder } from "../../../../shared";
import { WorkplanContext } from "../../../WorkPlanContext";

const ApprovedStatus = () => {
  const { statuses } = React.useContext(WorkplanContext);

  return (
    <>
      <Box sx={{ display: "flex", gap: "8px", paddingBottom: "8px" }}>
        <ETCaption1 bold>Status</ETCaption1>
        <ETCaption1 bold sx={{ letterSpacing: "0.39px" }}>
          {moment(statuses[0]?.start_date).format("ll")}
        </ETCaption1>
      </Box>
      <DashedBorder>{statuses[0]?.description}</DashedBorder>
    </>
  );
};

export default ApprovedStatus;
