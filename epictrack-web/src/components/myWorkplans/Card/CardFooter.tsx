import { Button, Grid } from "@mui/material";
import { Palette } from "../../../styles/theme";
import { ETCaption1, ETCaption2, ETParagraph } from "../../shared";
import Icons from "../../icons";
import { IconProps } from "../../icons/type";

const EyeIcon: React.FC<IconProps> = Icons["EyeIcon"];

const CardFooter = () => {
  return (
    <Grid
      container
      direction="row"
      justifyContent="space-between"
      sx={{
        backgroundColor: Palette.white,
        borderTop: `1px solid var(--neutral-background-dark, #DBDCDC)`,
        padding: "16px 32px",
        alignItems: "center",
      }}
    >
      <Grid item>
        <Grid container spacing={2}>
          <Grid item>
            <Grid container direction="column" spacing={1}>
              <Grid item>
                <ETCaption1 color={Palette.neutral.main}>TEAM</ETCaption1>
              </Grid>
              <Grid item>
                <ETParagraph color={Palette.neutral.dark}>MMT</ETParagraph>
              </Grid>
            </Grid>
          </Grid>
          <Grid item>
            <Grid container direction="column" spacing={1}>
              <Grid item>
                <ETCaption1 color={Palette.neutral.main}>
                  PROJECT LEAD
                </ETCaption1>
              </Grid>
              <Grid item>
                <ETParagraph color={Palette.neutral.dark}>
                  Katherine St James
                </ETParagraph>
              </Grid>
            </Grid>
          </Grid>
          <Grid item>
            <Grid container direction="column" spacing={1}>
              <Grid item>
                <ETCaption1 color={Palette.neutral.main}>STAFF</ETCaption1>
              </Grid>
              <Grid item>{/* TODO: Staff icon display here */}</Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Grid item>
        <Button
          variant="text"
          startIcon={<EyeIcon />}
          sx={{
            backgroundColor: "inherit",
            borderColor: "transparent",
          }}
          onClick={() => undefined}
        >
          <ETCaption2 bold>View Only</ETCaption2>
        </Button>
      </Grid>
    </Grid>
  );
};

export default CardFooter;
