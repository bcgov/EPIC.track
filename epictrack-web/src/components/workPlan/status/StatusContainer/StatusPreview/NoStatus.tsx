import { Box } from "@mui/material";
import { ETCaption1, ETPreviewText, ETPreviewBox } from "../../../../shared";
import { Palette } from "../../../../../styles/theme";

const NoStatus = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        backgroundColor: Palette.neutral.bg.light,
        padding: "16px 24px",
      }}
    >
      <ETCaption1 bold>Status</ETCaption1>
      <ETPreviewBox>
        <ETPreviewText color={Palette.neutral.light}>
          Your status will appear here.
        </ETPreviewText>
      </ETPreviewBox>
    </Box>
  );
};

export default NoStatus;
