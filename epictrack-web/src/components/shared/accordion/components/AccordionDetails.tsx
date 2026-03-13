import AccordionDetails from "@mui/material/AccordionDetails";
import { styled } from "@mui/material";

const ETAccordionDetails = styled(AccordionDetails)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "8px",
  flexShrink: 0,
  padding: "1rem 1.5rem",
  width: "100%",
  boxSizing: "border-box",
  overflow: "clip",
  [theme.breakpoints.down("sm")]: {
    padding: "1.5rem 0.5rem 0.75rem",
  },
}));

export default ETAccordionDetails;
