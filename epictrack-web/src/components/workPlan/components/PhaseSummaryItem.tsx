import React from "react";
import { Box } from "@mui/material";
import { Palette } from "../../../styles/theme";
import { ETCaption1 } from "../../shared";

const PhaseSummaryItem = ({ ...props }) => {
  return (
    <Box
      sx={{
        display: "flex",
        gap: "0.5rem",
        flexDirection: "column",
        minHeight: "48px",
        ...props.sx,
      }}
    >
      <ETCaption1
        sx={{ textTransform: "uppercase", color: `${Palette.neutral.main}` }}
      >
        {props.label}
      </ETCaption1>
      <Box sx={{ minHeight: "24px" }}>{props.children}</Box>
    </Box>
  );
};

export default PhaseSummaryItem;
