import { Box, Container, Grid } from "@mui/material";
import React from "react";
import Card from "./Card";

const CardList = () => {
  return (
    <Grid
      container
      direction="row"
      justifyContent="space-evenly"
      alignItems="flex-start"
      spacing={2}
    >
      <Grid item>
        <Card />
      </Grid>
      <Grid item>
        <Card />
      </Grid>
      <Grid item>
        <Card />
      </Grid>
    </Grid>
  );
};

export default CardList;
