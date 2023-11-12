import React from "react";
import { Grid, SxProps } from "@mui/material";
import { ETHeading3, ETParagraph } from "../../shared";
import { Palette } from "../../../styles/theme";
import TeamList from "./TeamList";
import TeamInfo from "./TeamInfo";

const title: SxProps = {
  borderBottom: `2px solid ${Palette.primary.main}`,
  paddingBottom: "0.5rem",
};

const TeamContainer = () => {
  return (
    <Grid container columnSpacing={1.5}>
      <Grid item xs={8}>
        <ETHeading3
          sx={{
            ...title,
          }}
          color={Palette.primary.main}
        >
          Team Members
        </ETHeading3>
      </Grid>
      <Grid item xs={4}>
        <ETHeading3
          sx={{
            ...title,
          }}
          color={Palette.primary.main}
        >
          Team Information
        </ETHeading3>
      </Grid>
      <Grid
        item
        xs={8}
        sx={{
          pt: "2rem",
        }}
      >
        <TeamList />
      </Grid>
      <Grid
        item
        xs={4}
        sx={{
          pt: "2rem",
        }}
      >
        <TeamInfo />
      </Grid>
    </Grid>
  );
};

export default TeamContainer;
