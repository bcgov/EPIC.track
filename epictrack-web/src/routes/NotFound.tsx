import { Grid } from "@mui/material";
import { ETHeading1, ETPageContainer } from "../components/shared";
import React from "react";
import { IProps } from "./types";
import ErrorIcon from "@mui/icons-material/ErrorOutlineOutlined";

const NotFound = React.memo(
  ({
    errorMessage = "We couldn't find page page your are looking for.",
    errorCode = "404",
  }: IProps) => {
    return (
      <ETPageContainer
        container
        direction="row"
        justifyContent="center"
        alignItems="center"
        spacing={1}
        padding={"2em 2em 1em 2em"}
      >
        <Grid item xs={12} justifyContent="center">
          <ETHeading1 align="center">
            Oh no! Something went wrong.
            <br />
            {errorMessage} ({errorCode})
          </ETHeading1>
        </Grid>
        <Grid
          item
          xs={12}
          container
          direction="row"
          alignItems="center"
          justifyContent="center"
        >
          <ErrorIcon sx={{ height: "10em", width: "10em" }} />
        </Grid>
      </ETPageContainer>
    );
  }
);

export default NotFound;
