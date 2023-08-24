import React from "react";
import { Accordion } from "@mui/material";
import { AccordionProps as MuiAccordionProps } from "@mui/material/Accordion";
import { Palette } from "../../../styles/theme";

const ETAccordion = (props: MuiAccordionProps) => {
  return (
    <Accordion
      expanded={props.expanded}
      onChange={props.onChange}
      sx={{
        border: `1px solid ${Palette.primary.main}`,
        borderLeft: `${props.expanded ? "4px" : "1px"} solid ${
          Palette.primary.main
        }`,
        borderRadius: `${props.expanded ? "8px" : "5px"} !important`,
        ".MuiAccordionSummary-root": {
          flexDirection: "row-reverse",
          borderRadius: props.expanded ? "4px 4px 0px 0px" : "4px",
        },
        ".Mui-expanded": {
          mt: "0px !important",
          mb: "0px !important",
        },
      }}
    >
      {props.children}
    </Accordion>
  );
};

export default ETAccordion;
