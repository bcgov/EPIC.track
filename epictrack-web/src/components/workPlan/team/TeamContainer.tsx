import React from "react";
import { Grid } from "@mui/material";
import { ETParagraph } from "../../shared";
import { Palette } from "../../../styles/theme";
import { makeStyles } from "@mui/styles";
import TeamGrid from "./TeamList";
import TeamInfo from "./TeamInfo";
const useStyle = makeStyles({
  title: {
    borderBottom: `2px solid ${Palette.primary.main}`,
    paddingBottom: "0.5rem",
  },
});

const TeamContainer = () => {
  const classes = useStyle();
  return (
    <Grid container columnSpacing={1.5}>
      <Grid item xs={8}>
        <ETParagraph className={classes.title} color={Palette.primary.main}>
          Team Members
        </ETParagraph>
      </Grid>
      <Grid item xs={4}>
        <ETParagraph className={classes.title} color={Palette.primary.main}>
          Team Information
        </ETParagraph>
      </Grid>
      <Grid
        item
        xs={8}
        sx={{
          pt: "2rem",
        }}
      >
        <TeamGrid />
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
