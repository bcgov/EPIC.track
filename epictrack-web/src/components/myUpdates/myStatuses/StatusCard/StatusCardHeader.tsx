import { Box, Stack, Tooltip } from "@mui/material";
import { Palette } from "../../../../styles/theme";
import { ETCaption1 } from "../../../shared";
import { StatusCardProps } from ".";
import StatusBadge from "../../StatusBadge";

const StatusCardHeader = ({ item }: StatusCardProps) => {
  const status = item;
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      justifyContent="space-between"
      alignItems={{ xs: "flex-start", sm: "center" }}
      spacing={2}
      sx={{
        backgroundColor: Palette.neutral.bg.light,
        borderBottom: `2px solid ${Palette.neutral.bg.dark}`,
        padding: "0.875rem",
        textTransform: "uppercase",
        fontSize: "13px",
        minHeight: "88px",
      }}
    >
      <Box sx={{ flex: 1, alignSelf: "flex-start" }}>
        <Tooltip title={status?.work_name ?? ""}>
          <span>
            <ETCaption1
              bold
              color={Palette.neutral.dark}
              sx={{
                display: "-webkit-box",
                overflow: "hidden",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: 3,
                textOverflow: "ellipsis",
              }}
            >
              {status?.work_name}
            </ETCaption1>
          </span>
        </Tooltip>
      </Box>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems={{ xs: "flex-start", sm: "center" }}
      >
        <Stack spacing={0.5}>
          <ETCaption1
            color={Palette.neutral.dark}
            sx={{ lineHeight: "1.2rem" }}
          >
            Project Status
          </ETCaption1>
          <ETCaption1 color={Palette.neutral.dark}>
            <StatusBadge is_active={status?.project_is_active} />
          </ETCaption1>
        </Stack>
        <Stack spacing={0.5}>
          <ETCaption1
            color={Palette.neutral.dark}
            sx={{ lineHeight: "1.2rem" }}
          >
            Work Status
          </ETCaption1>
          <ETCaption1 color={Palette.neutral.dark}>
            <StatusBadge is_active={status?.work_is_active} />
          </ETCaption1>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default StatusCardHeader;
