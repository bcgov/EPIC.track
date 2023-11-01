import { Box } from "@mui/material";
import { ETHeading4, ETParagraph } from "../../shared";
import { Palette } from "../../../styles/theme";
import Icons from "../../icons";
import { IconProps } from "../../icons/type";

const NotificationWarning: React.FC<IconProps> = Icons["NotificationWarning"];

const StatusOutOfDateBanner = () => {
  return (
    <Box
      sx={{
        backgroundColor: Palette.secondary.bg.light,
        padding: "16px 24px",
        gap: "8px",
        display: "flex",
        flexDirection: "column",
        marginBottom: "16px",
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "row", gap: "16px" }}>
        <NotificationWarning />
        <ETHeading4 bold color={Palette.secondary.dark}>
          The Work status is out of date
        </ETHeading4>
      </Box>
      <ETParagraph color={Palette.secondary.dark}>
        Please provide an updated status
      </ETParagraph>
    </Box>
  );
};

export default StatusOutOfDateBanner;
