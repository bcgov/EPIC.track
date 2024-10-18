import { Chip, ChipProps, styled } from "@mui/material";
import { Palette } from "../../../styles/theme";

const chipStyles = {
  fontWeight: "bold",
  borderRadius: "4px",
  minWidth: "80px",
};

interface StyledChipProps extends ChipProps {
  active?: boolean;
  inactive?: boolean;
  highPriority?: boolean;
  error?: boolean;
}

const ETChip = styled(
  ({
    active = true,
    inactive = false,
    highPriority = false,
    error = false,
    size = "small",
    ...other
  }: StyledChipProps) => <Chip size={size} {...other} />
)(({ active, inactive, highPriority, error }: StyledChipProps) => {
  if (inactive) {
    return {
      background: "#F2F2F2",
      color: "#6D7274",
      ...chipStyles,
    };
  }
  if (highPriority) {
    return {
      background: `${Palette.secondary.bg.light}`,
      color: `${Palette.secondary.dark}`,
      ...chipStyles,
    };
  }
  if (error) {
    return {
      background: `${Palette.error.bg.light}`,
      color: `${Palette.error.dark}`,
      ...chipStyles,
    };
  }
  if (active) {
    return {
      background: Palette.success.bg.light,
      color: Palette.success.dark,
      ...chipStyles,
    };
  }
  return {};
});

export { ETChip };
