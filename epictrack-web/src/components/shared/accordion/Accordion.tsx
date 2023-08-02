import React from "react";
import { AccordionProps } from "./type";
import { Accordion } from "@mui/material";

const ETAccordion = (props: AccordionProps) => {
  return (
    <Accordion
      expanded={props.activePane === props.phaseId}
      onChange={props.handleExpand(props.phaseId)}
      sx={{
        ".MuiAccordionSummary-root": {
          flexDirection: "row-reverse",
        },
      }}
    >
      {props.children}
    </Accordion>
  );
};

export default ETAccordion;
