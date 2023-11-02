import { Box } from "@mui/material";
import { DashedBorder, ETCaption1 } from "../../../../shared";

const UnapprovedStatus = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <ETCaption1 bold>Status</ETCaption1>
      <DashedBorder>Once approved, Status will appear here.</DashedBorder>
    </Box>
  );
};

export default UnapprovedStatus;
