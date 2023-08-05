import { AccordionSummary, styled } from "@mui/material";
import { AccordionStyledProps } from "../type";
import { Palette } from "../../../../styles/theme";

const ETAccordionSummary = styled(AccordionSummary)(
  (props: AccordionStyledProps) => ({
    border: `1px solid ${Palette.primary.main}`,
    "& .MuiAccordionSummary-content": {
      margin: 0,
    },
  })
);

export default ETAccordionSummary;
