import { Box } from "@mui/material";
import { ETCaption1, ETPreviewBox } from "../../../../shared";
import { Palette } from "../../../../../styles/theme";

const UnapprovedStatus = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <ETCaption1 bold>Status</ETCaption1>
      <ETPreviewBox>
        <ETPreviewBox color={Palette.neutral.light}>
          Once approved, Status will appear here.
        </ETPreviewBox>
      </ETPreviewBox>
    </Box>
  );
};

export default UnapprovedStatus;
