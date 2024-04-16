import { Chip, ChipProps, styled } from "@mui/material";
import { Palette } from "../../../styles/theme";

const chipStyles = {
  fontWeight: "bold",
  borderRadius: "4px",
  minWidth: "80px",
};

const ActiveChip = styled(({ size = "small", ...other }: ChipProps) => (
  <Chip size={size} {...other} />
))({
  background: Palette.success.bg.light,
  color: Palette.success.dark,
  ...chipStyles,
});

const InactiveChip = styled(({ size = "small", ...other }: ChipProps) => (
  <Chip size={size} {...other} />
))({
  background: "#F2F2F2",
  color: "#6D7274",
  ...chipStyles,
});

const HighPriorityChip = styled(({ size = "small", ...other }: ChipProps) => (
  <Chip size={size} {...other} />
))({
  background: `${Palette.secondary.bg.light}`,
  color: `${Palette.secondary.dark}`,
  ...chipStyles,
});

const ErrorChip = styled(({ size = "small", ...other }: ChipProps) => (
  <Chip size={size} {...other} />
))({
  background: `${Palette.error.bg.light}`,
  color: `${Palette.error.dark}`,
  ...chipStyles,
});

export { ActiveChip, InactiveChip, HighPriorityChip, ErrorChip };
