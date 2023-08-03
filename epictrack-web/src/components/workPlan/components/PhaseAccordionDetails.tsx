import React from "react";
import ETAccordionDetails from "../../shared/accordion/components/AccordionDetails";
import PhaseAccordionActions from "./PhaseAccordionActions";
import { AccordionProps as MuiAccordionProps } from "@mui/material/Accordion";

const PhaseAccordionDetails = ({ ...props }: MuiAccordionProps) => {
  return (
    <ETAccordionDetails expanded={props.expanded}>
      <PhaseAccordionActions></PhaseAccordionActions>
    </ETAccordionDetails>
  );
};

export default PhaseAccordionDetails;
