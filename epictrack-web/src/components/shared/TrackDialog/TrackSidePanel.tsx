import { Box } from "@mui/material";
import { FC } from "react";
import { Palette } from "styles/theme";
import { TrackDialogProps } from ".";
import TrackDialogContent from "./TrackDialogContent";

export const DEFAULT_PANEL_SIZE = 450;

export const TrackSidePanel: FC<TrackDialogProps> = (props) => {
  return (
    <Box
      sx={{
        width: `${DEFAULT_PANEL_SIZE}px`,
        backgroundColor: Palette.neutral.bg.light,
        overflowY: "auto",
        height: "100%",
      }}
    >
      <TrackDialogContent {...props} />
    </Box>
  );
};

export default TrackSidePanel;
