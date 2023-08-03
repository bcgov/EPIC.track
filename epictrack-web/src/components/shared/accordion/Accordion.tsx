import React from "react";
import { Accordion } from "@mui/material";
import { AccordionProps as MuiAccordionProps } from "@mui/material/Accordion";

const ETAccordion = (props: MuiAccordionProps) => {
  return (
    <Accordion
      expanded={props.expanded}
      onChange={props.onChange}
      sx={{
        ".MuiAccordionSummary-root": {
          flexDirection: "row-reverse",
          borderRadius: props.expanded ? "4px 4px 0px 0px" : "4px",
          borderLeft: "4px solid",
        },
        ".Mui-expanded": {
          margin: "0px !important",
        },
      }}
    >
      {props.children}
    </Accordion>
  );
};

export default ETAccordion;
