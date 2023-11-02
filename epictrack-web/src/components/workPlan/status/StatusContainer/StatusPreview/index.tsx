import React from "react";
import { Box } from "@mui/material";
import { Palette } from "../../../../../styles/theme";
import { WorkplanContext } from "../../../WorkPlanContext";
import NoStatus from "./NoStatus";
import UnapprovedStatus from "./UnapprovedStatus";
import ApprovedStatus from "./ApprovedStatus";

const StatusPreview = () => {
  const { statuses } = React.useContext(WorkplanContext);

  if (statuses.length === 0) {
    return <NoStatus />;
  }

  return (
    <Box
      sx={{
        backgroundColor: Palette.neutral.bg.light,
        padding: "16px 24px",
      }}
    >
      {statuses.length > 0 && statuses[0].approved === false && (
        <UnapprovedStatus />
      )}
      {statuses.length > 0 && statuses[0].approved === true && (
        <ApprovedStatus />
      )}
    </Box>
  );
};

export default StatusPreview;
