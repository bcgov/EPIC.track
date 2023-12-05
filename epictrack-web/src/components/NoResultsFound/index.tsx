import React from "react";
import { Container, Grid } from "@mui/material";
import { ETHeading1, ETHeading3, ETPageContainer } from "../shared";
import { Palette } from "../../styles/theme";
import SearchIcon from "@mui/icons-material/Search";

const NoResultsFound = () => {
  return (
    <ETPageContainer
      container
      direction="row"
      justifyContent="center"
      alignItems="center"
      spacing={1}
    >
      <Container>
        <Grid
          item
          container
          justifyContent={"center"}
          alignItems={"center"}
          direction="column"
          spacing={2}
        >
          <Grid item>
            <SearchIcon sx={{ height: "3em", width: "3em" }} />
          </Grid>
          <Grid item>
            <ETHeading1
              bold
              sx={{
                color: Palette.neutral.dark,
              }}
            >
              No results found
            </ETHeading1>
          </Grid>
          <Grid item>
            <ETHeading3
              sx={{
                color: Palette.neutral.main,
              }}
            >
              Adjust your parameters and try again
            </ETHeading3>
          </Grid>
        </Grid>
      </Container>
    </ETPageContainer>
  );
};

export default NoResultsFound;
