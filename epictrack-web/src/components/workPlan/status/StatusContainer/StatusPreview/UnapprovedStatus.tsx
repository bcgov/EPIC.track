import { Box } from "@mui/material";
import { ETCaption1, ETPreviewBox, ETPreviewText } from "../../../../shared";
import { Palette } from "../../../../../styles/theme";

const UnapprovedStatus = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <ETCaption1 bold>Status</ETCaption1>
      <ETPreviewBox>
        <ETPreviewText color={Palette.neutral.light}>
          Once approved, Status will appear here.
        </ETPreviewText>
      </ETPreviewBox>
    </Box>
  );
};

export default UnapprovedStatus;
