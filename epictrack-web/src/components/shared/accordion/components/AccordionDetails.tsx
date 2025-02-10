import AccordionDetails from "@mui/material/AccordionDetails";
import { styled } from "@mui/material";
import { AccordionStyledProps } from "../type";

const ETAccordionDetails = styled(AccordionDetails)(
  (props: AccordionStyledProps) => ({
    display: "inline-flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    flexShrink: 0,
    padding: "1rem 1.5rem",
    width: "100%",
  })
);

export default ETAccordionDetails;
