import { AccordionProps as MuiAccordionProps } from "@mui/material/Accordion";

export type AccordionProps = {
  activePane: string | number;
  loading: boolean;
  phaseId: number;
  handleExpand: (
    phaseId: number
  ) => (event: React.SyntheticEvent, isExpanded: boolean) => void;
} & MuiAccordionProps;
