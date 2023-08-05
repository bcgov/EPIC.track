import React from "react";
import AccordionDetails from "@mui/material/AccordionDetails";
import { styled } from "@mui/material";
import { Palette } from "../../../../styles/theme";
import { AccordionStyledProps } from "../type";

const ETAccordionDetails = styled(AccordionDetails)(
  (props: AccordionStyledProps) => ({
    display: "inline-flex",
    height: "540px",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    flexShrink: 0,
    padding: "1rem 1.5rem",
    width: "100%",
    border: `1px solid ${Palette.primary.main}`,
    borderTop: props.expanded ? "0px" : "1px",
  })
);

export default ETAccordionDetails;
