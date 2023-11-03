import React from "react";
import { Box } from "@mui/material";
import { Palette } from "../../../../../styles/theme";
import { WorkplanContext } from "../../../WorkPlanContext";
import NoStatus from "./NoStatus";
import UnapprovedStatus from "./UnapprovedStatus";
import ApprovedStatus from "./ApprovedStatus";
import { Status } from "../../../../../models/status";

const StatusPreview = () => {
  const { statuses } = React.useContext(WorkplanContext);
  const [statusForPreview, setStatusForPreview] = React.useState<Status>();

  React.useEffect(() => {
    if (statuses.length > 0) {
      if (statuses[0]?.is_approved) {
        setStatusForPreview(statuses[0]);
      } else if (statuses[1]?.is_approved) {
        setStatusForPreview(statuses[1]);
      }
    }
  }, [statuses]);

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
      {!statusForPreview && <UnapprovedStatus />}
      {statusForPreview && (
        <ApprovedStatus statusForPreview={statusForPreview} />
      )}
    </Box>
  );
};

export default StatusPreview;
