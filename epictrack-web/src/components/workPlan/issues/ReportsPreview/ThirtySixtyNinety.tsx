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
import { Grid } from "@mui/material";
import { Palette } from "../../../../styles/theme";

export const ThirtySixtyNinety = () => {
  return (
    <GrayBox>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <BoxTitle
            sx={{
              color: Palette.primary.main,
            }}
            bold
          >
            30-60-90 Preview
          </BoxTitle>
        </Grid>
        <Grid item xs={12}>
          <BoxSubtitle>Project Description</BoxSubtitle>
          <ETParagraph>Placeholder project description</ETParagraph>
          <ETParagraph>{/** project name is in phase name */}</ETParagraph>
        </Grid>

        <Grid item xs={12}>
          <BoxSubtitle>Status</BoxSubtitle>
          <ETParagraph>Placeholder status text</ETParagraph>
        </Grid>

        <Grid item xs={12}>
          <BoxLabel bold mb={"0.5em"}>
            Issues
          </BoxLabel>
          <PreviewBox>
            <PlaceholderText>Your Issues will appear here.</PlaceholderText>
          </PreviewBox>
        </Grid>
      </Grid>
    </GrayBox>
  );
};
