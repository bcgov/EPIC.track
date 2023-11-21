import { Chip, styled } from "@mui/material";
import { Palette } from "../../../styles/theme";

const ActiveChip = styled(Chip)({
  background: "#C2EACA",
  color: "#236430",
  fontWeight: "bold",
  borderRadius: "4px",
  padding: "4px 8px",
  gap: "8px",
  width: "100px",
});

const InactiveChip = styled(Chip)({
  background: "#F2F2F2",
  color: "#6D7274",
  fontWeight: "bold",
  borderRadius: "4px",
  padding: "4px 8px",
  gap: "8px",
  width: "100px",
});

const HighPriorityChip = styled(Chip)({
  background: `${Palette.secondary.bg.light}`,
  color: `${Palette.secondary.dark}`,
  fontWeight: "bold",
  borderRadius: "4px",
  padding: "4px 8px",
  gap: "8px",
});

const ErrorChip = styled(Chip)({
  background: `${Palette.error.bg.light}`,
  color: `${Palette.error.dark}`,
  fontWeight: "bold",
  borderRadius: "4px",
  padding: "4px 8px",
  gap: "8px",
});

export { ActiveChip, InactiveChip, HighPriorityChip, ErrorChip };
