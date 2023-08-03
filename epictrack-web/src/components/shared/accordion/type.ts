import { AccordionProps as MuiAccordionProps } from "@mui/material/Accordion";
import { MUIStyledCommonProps } from "@mui/system";

export type AccordionProps = {
  expanded?: boolean;
} & MuiAccordionProps;

export type AccordionStyledProps = {
  expanded?: boolean;
} & MUIStyledCommonProps;
