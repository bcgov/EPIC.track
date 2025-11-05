import { Palette } from "../../styles/theme";
import { Box, BoxProps } from "@mui/system";

type StatusBadgeProps = {
  is_active: boolean;
} & BoxProps;

const StatusBadge = ({ is_active, ...boxProps }: StatusBadgeProps) => {
  const status = is_active ? "Active" : "Inactive";
  const backgroundColour = is_active
    ? Palette.primary.bg.main
    : Palette.neutral.bg.main;
  const colour = is_active ? Palette.primary.main : Palette.neutral.main;

  return (
    <Box
      {...boxProps}
      sx={{
        borderRadius: "4px",
        padding: "4px 8px",
        backgroundColor: backgroundColour,
        color: colour,
        whiteSpace: "nowrap",
        textTransform: "capitalize",
        display: "inline-block",
        fontWeight: "700",
        ...boxProps.sx,
      }}
    >
      {status}
    </Box>
  );
};

export default StatusBadge;
