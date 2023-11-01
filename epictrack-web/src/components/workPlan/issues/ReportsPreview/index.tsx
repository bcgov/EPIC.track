import React from "react";
import {
  BoxLabel,
  BoxSubtitle,
  BoxTitle,
  ETParagraph,
  GrayBox,
  PreviewBox,
  PlaceholderText,
} from "../../../shared";
import { Button, Grid } from "@mui/material";
import { Palette } from "../../../../styles/theme";
import ThirtySixtyNinety from "../../../reports/30-60-90Report/ThirtySixtyNinety";

export const ReportsPreview = () => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Button variant="contained" color="success">
          30-60-90
        </Button>
      </Grid>
    </Grid>
  );
};
