import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/system";
import React from "react";
import { Palette } from "../../../../styles/theme";

const ETAccordionDetails = styled(AccordionDetails)({
  display: "inline-flex",
  height: "540px",
  flexDirection: "column",
  alignItems: "center",
  gap: "8px",
  flexShrink: 0,
  padding: "1rem 1.5rem",
  width: "100%",
  border: `1px solid ${Palette.primary.main}`,
});

export default ETAccordionDetails;
