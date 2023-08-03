import { AccordionSummary } from "@mui/material";
import { styled } from "@mui/system";
import { Palette } from "../../../../styles/theme";
import { AccordionStyledProps } from "../type";
import { makeStyles } from "@mui/styles";

const ETAccordionSummary = styled(AccordionSummary)(
  ({ expanded }: AccordionStyledProps) => ({
    border: `1px solid ${Palette.primary.main}`,
    "& .MuiAccordionSummary-content": {
      margin: 0,
    },
  })
);

export default ETAccordionSummary;
