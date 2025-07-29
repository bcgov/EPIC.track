import { Stack } from "@mui/material";
import icons from "../../../../icons";
import { ETCaption2, ETCaption3 } from "../../../../shared";
import { Palette } from "../../../../../styles/theme";

export const EmptyStatusHistory = () => {
  const StatusHistoryIcon = icons["TimelineIcon"];

  return (
    <Stack
      justifyContent={"center"}
      alignItems={"center"}
      sx={{
        height: "100%",
        padding: "1rem",
      }}
      spacing={1}
    >
      <span style={{ marginBottom: "0.5em" }}>
        <StatusHistoryIcon />
      </span>

      <ETCaption2 bold>Your Status History will appear here</ETCaption2>
      <ETCaption3 color={Palette.neutral.main}>
        Adding a New Update will create your Status History
      </ETCaption3>
    </Stack>
  );
};
