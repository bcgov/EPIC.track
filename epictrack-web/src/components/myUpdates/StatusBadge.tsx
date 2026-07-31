import { Palette } from "../../styles/theme";
import * as tokens from "../../styles/designTokens";
import { Box, BoxProps } from "@mui/system";

type StatusBadgeProps = {
  is_active: boolean;
} & BoxProps;

const StatusBadge = ({ is_active, ...boxProps }: StatusBadgeProps) => {
  const status = is_active ? "Active" : "Inactive";
  // Matches ETChip's active/inactive pair. This used to be blue for active while
  // ETChip was green, so the same concept looked different depending on screen.
  const backgroundColour = is_active
    ? Palette.success.bg.light
    : Palette.neutral.bg.main;
  const colour = is_active ? Palette.success.dark : Palette.neutral.main;

  return (
    <Box
      {...boxProps}
      sx={{
        borderRadius: tokens.layoutBorderRadiusMedium,
        padding: "4px 8px",
        backgroundColor: backgroundColour,
        color: colour,
        whiteSpace: "nowrap",
        textTransform: "capitalize",
        display: "inline-block",
        fontWeight: tokens.typographyFontWeightsBold,
        ...boxProps.sx,
      }}
    >
      {status}
    </Box>
  );
};

export default StatusBadge;
