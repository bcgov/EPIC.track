import { Grid } from "@mui/material";
import { Palette } from "../../../styles/theme";
import { ETCaption1, ETCardTitle } from "../../shared";

const CardHeader = () => {
  return (
    <Grid
      container
      sx={{
        width: "516",
        backgroundColor: Palette.neutral.bg.light,
        borderBottom: `1px solid var(--neutral-background-dark, #DBDCDC)`,
        padding: "12px 24px",
        alignItems: "center",
      }}
      justifyContent="space-between"
    >
      <Grid item>
        <ETCardTitle>COYOTE HYDROGEN</ETCardTitle>
      </Grid>
      <Grid item>
        <ETCaption1
          bold
          sx={{
            color: Palette.success.dark,
            backgroundColor: Palette.success.bg.light,
            padding: "4px 8px",
            borderRadius: "4px",
          }}
        >
          Active
        </ETCaption1>
      </Grid>
    </Grid>
  );
};

export default CardHeader;
