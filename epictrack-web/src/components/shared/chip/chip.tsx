import { Chip, styled } from "@mui/material";

const ActiveChip = styled(Chip)({
  background: "#C2EACA",
  color: "#236430",
  fontWeight: "bold",
  borderRadius: "4px",
  padding: "4px 8px",
  gap: "8px",
});

const InactiveChip = styled(Chip)({
  background: "#F2F2F2",
  color: "#6D7274",
  fontWeight: "bold",
  borderRadius: "4px",
  padding: "4px 8px",
  gap: "8px",
});

export { ActiveChip, InactiveChip };
