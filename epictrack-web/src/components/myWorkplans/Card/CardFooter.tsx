import { Grid } from "@mui/material";
import { Palette } from "../../../styles/theme";
import { ETCaption3 } from "../../shared";

const CardFooter = () => {
  return (
    <Grid
      container
      direction="row"
      sx={{
        width: "516",
        backgroundColor: Palette.white,
        borderTop: `1px solid var(--neutral-background-dark, #DBDCDC)`,
        padding: "16px 32px",
        alignItems: "center",
        gap: "8px",
      }}
    >
      <Grid item direction="column">
        <Grid item>
          <ETCaption3>TEAM</ETCaption3>
        </Grid>
        <Grid item>MMT</Grid>
      </Grid>
      <Grid item direction="column">
        <Grid item>PROJECT LEAD</Grid>
        <Grid item>Katherine St James</Grid>
      </Grid>
      <Grid item direction="column">
        <Grid item>STAFF</Grid>
        <Grid item>Staff Display</Grid>
      </Grid>
    </Grid>
  );
};

export default CardFooter;
