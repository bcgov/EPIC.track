import { Box } from "@mui/material";
import React from "react";
import { Palette } from "../../../styles/theme";
import { WorkplanContext } from "../WorkPlanContext";

export const ReportsPreview = () => {
  const { issues } = React.useContext(WorkplanContext);
  return (
    <Box
      sx={{
        backgroundColor: Palette.neutral.bg.light,
        padding: "16px 24px",
      }}
    >
      <Box
        sx={{
          fontSize: "14px",
          fontStyle: "normal",
          fontWeight: "700",
          lineHeight: "16px",
          paddingBottom: "8px",
        }}
      >
        Issue
      </Box>
      {issues.length === 0 && (
        <Box
          sx={{
            color: Palette.neutral.light,
            fontSize: "14px",
            fontStyle: "normal",
            fontWeight: "400",
            lineHeight: "24px",
            border: `1px dashed ${Palette.success.light}`,
            padding: "8px",
          }}
        >
          Your issue will appear here.
        </Box>
      )}
    </Box>
  );
};
