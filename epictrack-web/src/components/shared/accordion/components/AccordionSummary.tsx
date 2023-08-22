import { AccordionSummary, styled } from "@mui/material";
import { AccordionStyledProps } from "../type";
import { Palette } from "../../../../styles/theme";

const ETAccordionSummary = styled(AccordionSummary)(
  (props: AccordionStyledProps) => ({
    borderBottom: `${props.expanded ? "1px" : "0px"} solid ${
      Palette.primary.main
    }`,
    "& .MuiAccordionSummary-content": {
      margin: 0,
    },
  })
);

export default ETAccordionSummary;
